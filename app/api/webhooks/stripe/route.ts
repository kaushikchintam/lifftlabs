import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  //
  // checkout.session.completed / checkout.session.expired for bookings were
  // retired here — booking is no longer a payment event, it's gated on an
  // active subscription and confirmed synchronously in app/api/sessions/route.ts.
  // Subscription lifecycle events live in app/api/webhooks/stripe-billing/route.ts,
  // a separate endpoint with its own signing secret.
  switch (event.type) {
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