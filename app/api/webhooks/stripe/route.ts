import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSessionCalendarEvent } from "@/lib/calendar/writeback";
import { sendSessionConfirmation } from "@/lib/emails/session-confirmation";

// Signature verification needs the raw request bytes and the stripe SDK,
// keep this on the Node runtime, never Edge.
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe sends platform events (checkout.*) and Connect events
 * (account.updated, from connected accounts) through SEPARATE webhook
 * configurations, each with its own signing secret. Try both.
 * Locally, `stripe listen` forwards everything under one whsec_.
 */
function verifyEvent(rawBody: string, signature: string): Stripe.Event | null {
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET, // optional; set when the Connect endpoint exists
  ].filter(Boolean) as string[];

  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      /* try next secret */
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 1. Verify signature against the RAW body. Do not parse JSON first.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const event = verifyEvent(rawBody, signature);
  if (!event) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // 2. Idempotency: record the event id; a duplicate insert means we've
  // already handled this event, acknowledge and stop.
  const { error: ledgerError } = await supabaseAdmin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });

  if (ledgerError) {
    if (ledgerError.code === "23505") {
      // unique_violation: already processed
      return NextResponse.json({ received: true, duplicate: true });
    }
    // Ledger unavailable: return 500 so Stripe retries later, rather than
    // processing without idempotency protection.
    return NextResponse.json({ error: "ledger error" }, { status: 500 });
  }

  // 3. Handle. Keep DB transitions fast; everything slow is best-effort
  // after, so Stripe gets its 200 promptly.
  switch (event.type) {
    case "checkout.session.completed": {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const sessionId = checkout.metadata?.session_id;
      if (!sessionId) break;

      const { data: confirmed, error } = await supabaseAdmin.rpc(
        "confirm_session",
        { p_session_id: sessionId }
      );
      if (error) {
        console.error("confirm_session failed:", error);
        return NextResponse.json({ error: "confirm_failed" }, { status: 500 });
      }

      if (confirmed) {
        // Payment record (P4-04). The stripe_events ledger already guards
        // against replays; ignoreDuplicates backstops via the unique
        // constraint on stripe_payment_intent_id.
        const { error: paymentError } = await supabaseAdmin
          .from("payments")
          .upsert(
            {
              user_id: checkout.metadata!.learner_id,
              amount_pence: checkout.amount_total ?? 0,
              currency: checkout.currency ?? "gbp",
              stripe_payment_intent_id: checkout.payment_intent as string,
              item_type: "session",
              session_id: sessionId,
              status: "succeeded",
            },
            { onConflict: "stripe_payment_intent_id", ignoreDuplicates: true }
          );
        if (paymentError) {
          // Session is confirmed regardless; the record can be backfilled
          // from Stripe. Log loudly, don't fail the webhook.
          console.error("payments insert failed:", paymentError);
        }

        // Best-effort mirror to the mentor's Google Calendar. Must never
        // fail the webhook: the session is confirmed the moment the DB says so.
        await createSessionCalendarEvent(sessionId).catch((err) =>
          console.error("[writeback] unexpected:", err)
        );

        // EM-04: confirmation email with ICS to both participants.
        await sendSessionConfirmation(sessionId).catch((err) =>
          console.error("[email] unexpected:", err)
        );
        // Note: if confirm_session returned false, payment completed for a
        // session no longer pending (e.g. hold released first) - at 35min
        // holds vs 30min checkout expiry this shouldn't occur; if it ever
        // does, this is where a refund would be issued. Log loudly.
      } else {
        console.error(
          `checkout.session.completed for non-pending session ${sessionId} - investigate (possible refund needed)`
        );
      }
      break;
    }

    case "checkout.session.expired": {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const sessionId = checkout.metadata?.session_id;
      if (!sessionId) break;

      const { error } = await supabaseAdmin.rpc("release_session", {
        p_session_id: sessionId,
      });
      if (error) {
        console.error("release_session failed:", error);
        return NextResponse.json({ error: "release_failed" }, { status: 500 });
      }
      break;
    }

    // P4-01: mentor payout readiness. Ready only when Stripe reports BOTH
    // charges and payouts enabled - booking is gated on this boolean.
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const ready = !!account.charges_enabled && !!account.payouts_enabled;

      const { error } = await supabaseAdmin
        .from("mentor_profiles")
        .update({ charges_enabled: ready })
        .eq("stripe_account_id", account.id);

      if (error) {
        console.error("account.updated handling failed:", error);
        return NextResponse.json({ error: "account_update_failed" }, { status: 500 });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}