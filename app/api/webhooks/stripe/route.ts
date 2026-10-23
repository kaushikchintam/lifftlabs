import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendSessionConfirmation } from "@/lib/emails/session-confirmation";

// Signature verification needs the raw request bytes and the stripe SDK,
// keep this on the Node runtime, never Edge.
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe sends platform events (checkout.*, charge.*) and Connect events
 * (account.updated, from connected accounts) through SEPARATE webhook
 * configurations, each with its own signing secret. Try both.
 * Locally, `stripe listen` forwards everything under one whsec_.
 */
function verifyEvent(rawBody: string, signature: string): Stripe.Event | null {
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET, process.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter(
    Boolean
  ) as string[];
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      /* try next secret */
    }
  }
  return null;
}

/** Thrown to make Stripe retry. */
class Retry extends Error {}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const sessionId = checkout.metadata?.session_id;
      if (checkout.mode !== "payment" || !sessionId) return;
      const paymentIntent = checkout.payment_intent as string;

      const { data: confirmed, error } = await supabaseAdmin.rpc("confirm_session", { p_session_id: sessionId });
      if (error) throw new Retry(`confirm_session failed: ${error.message}`);

      if (!confirmed) {
        // Paid for a session that's no longer pending (hold released first).
        // The slot may be gone, so give the money back rather than double-book.
        console.error(`checkout.session.completed for non-pending session ${sessionId} — refunding`);
        await stripe.refunds.create(
          { payment_intent: paymentIntent, reverse_transfer: true, refund_application_fee: true },
          { idempotencyKey: `late-${sessionId}` }
        );
        return;
      }

      // Destination charge: Stripe already created the transfer; record it.
      const pi = await stripe.paymentIntents.retrieve(paymentIntent, { expand: ["latest_charge"] });
      const transfer = (pi.latest_charge as Stripe.Charge | null)?.transfer;
      await supabaseAdmin
        .from("mentor_sessions")
        .update({
          stripe_payment_intent_id: paymentIntent,
          stripe_transfer_id: typeof transfer === "string" ? transfer : (transfer?.id ?? null),
          transferred_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      // Conversation from first booking (idempotent RPC), then email. Both best-effort.
      const { error: convoError } = await supabaseAdmin.rpc("get_or_create_conversation", {
        p_user_a: checkout.metadata!.mentor_id,
        p_user_b: checkout.metadata!.learner_id,
      });
      if (convoError) console.error("conversation create failed:", convoError);
      await sendSessionConfirmation(sessionId).catch((err) => console.error("[email] unexpected:", err));
      return;
    }

    case "checkout.session.expired": {
      const sessionId = (event.data.object as Stripe.Checkout.Session).metadata?.session_id;
      if (!sessionId) return;
      const { error } = await supabaseAdmin.rpc("release_session", { p_session_id: sessionId });
      if (error) throw new Retry(`release_session failed: ${error.message}`);
      return;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!paymentIntent) return;

      const { data: s, error } = await supabaseAdmin
        .from("mentor_sessions")
        .update({ status: "cancelled", refunded_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", paymentIntent)
        .select("slot_id, scheduled_at")
        .maybeSingle();
      if (error) throw new Retry(`refund update failed: ${error.message}`);

      // Free the time again if it's still in the future.
      if (s?.slot_id && new Date(s.scheduled_at) > new Date()) {
        await supabaseAdmin.from("mentor_open_slots").update({ status: "open" }).eq("id", s.slot_id);
      }
      return;
    }

    // Mentor payout readiness: ready only when Stripe reports BOTH charges
    // and payouts enabled — matching and booking are gated on this.
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const { error } = await supabaseAdmin
        .from("mentor_profiles")
        .update({ charges_enabled: !!account.charges_enabled && !!account.payouts_enabled })
        .eq("stripe_account_id", account.id);
      if (error) throw new Retry(`account.updated failed: ${error.message}`);
      return;
    }
  }
}

export async function POST(request: NextRequest) {
  // 1. Verify signature against the RAW body. Do not parse JSON first.
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const event = verifyEvent(rawBody, signature);
  if (!event) return NextResponse.json({ error: "invalid signature" }, { status: 400 });

  // 2. Idempotency: claim the event id; a duplicate means it's been handled.
  const { error: ledgerError } = await supabaseAdmin.from("stripe_events").insert({ id: event.id, type: event.type });
  if (ledgerError) {
    if (ledgerError.code === "23505") return NextResponse.json({ received: true, duplicate: true });
    return NextResponse.json({ error: "ledger error" }, { status: 500 });
  }

  // 3. Handle. On failure, release the claim so Stripe's retry is processed
  //    instead of being swallowed as a duplicate.
  try {
    await handle(event);
  } catch (err) {
    console.error(`[stripe] ${event.type} ${event.id} failed:`, err);
    await supabaseAdmin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
