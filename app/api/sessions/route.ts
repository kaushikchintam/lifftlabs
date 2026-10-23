import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { bookingLimiter, rateLimitKey } from "@/lib/rate-limit";
import { sessionPricing } from "@/features/journeys/config";
import { isPlus } from "@/lib/auth/role";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Stripe Checkout's expires_at has a hard 30-minute MINIMUM; the DB hold
 *  must outlive the checkout page, hence 35. */
const CHECKOUT_EXPIRY_MINUTES = 30;
const HOLD_MINUTES = 35;

const schema = z.object({
  slotId: z.uuid(),
  intakeId: z.uuid(),
  previousSessionId: z.uuid().optional(),
});

/**
 * POST /api/sessions — hold a slot and open Stripe Checkout.
 *
 * Destination charges: LIFFT is the merchant of record; Stripe transfers the
 * mentor's share the moment the charge succeeds and LIFFT keeps
 * application_fee_amount. The session is confirmed by the checkout webhook.
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!session.user.emailVerified) return NextResponse.json({ error: "email_unverified" }, { status: 403 });

  const { success } = await bookingLimiter.limit(rateLimitKey(request, session.user.id));
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const body = parsed.data;
  const learnerId = session.user.id;

  // Saved at signup (or a later journey); must be this learner's.
  const { data: intake } = await supabaseAdmin
    .from("intakes")
    .select("id, journey")
    .eq("id", body.intakeId)
    .eq("learner_id", learnerId)
    .maybeSingle();
  if (!intake) return NextResponse.json({ error: "intake_not_found" }, { status: 400 });

  // 1. Slot + mentor must be bookable BEFORE we lock the slot for 35 min.
  const { data: slot } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, mentor_id, status")
    .eq("id", body.slotId)
    .maybeSingle();
  if (!slot || slot.status !== "open") return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  if (slot.mentor_id === learnerId) return NextResponse.json({ error: "own_slot" }, { status: 400 });

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("hourly_rate_pence, charges_enabled, paused, stripe_account_id, user:user(name)")
    .eq("user_id", slot.mentor_id)
    .maybeSingle();
  if (!mentor?.charges_enabled || mentor.paused || !mentor.hourly_rate_pence || !mentor.stripe_account_id) {
    return NextResponse.json({ error: "mentor_not_bookable" }, { status: 403 });
  }
  const mentorName = (mentor.user as unknown as { name: string } | null)?.name;
  // LIFFT Plus members pay less; the discount comes out of LIFFT's fee.
  const { amount, fee, mentorShare } = sessionPricing(mentor.hourly_rate_pence as number, await isPlus(learnerId));

  // A rebook only links to a session this learner actually had.
  let previousSessionId: string | null = null;
  if (body.previousSessionId) {
    const { data: prev } = await supabaseAdmin
      .from("mentor_sessions")
      .select("id")
      .eq("id", body.previousSessionId)
      .eq("learner_id", learnerId)
      .maybeSingle();
    previousSessionId = prev?.id ?? null;
  }

  // 2. Atomically hold the slot + create the pending session.
  const { data: sessionId, error: holdError } = await supabaseAdmin.rpc("hold_slot", {
    p_slot_id: body.slotId,
    p_learner_id: learnerId,
    p_hold_minutes: HOLD_MINUTES,
  });
  if (holdError || !sessionId) {
    const gone =
      holdError?.message?.includes("slot_unavailable") || holdError?.message?.includes("no_overlapping_sessions");
    return NextResponse.json({ error: gone ? "slot_unavailable" : "booking_failed" }, { status: gone ? 409 : 500 });
  }

  await supabaseAdmin
    .from("mentor_sessions")
    .update({
      journey: intake.journey,
      intake_id: intake.id,
      amount_pence: amount,
      fee_pence: fee,
      mentor_share_pence: mentorShare,
      previous_session_id: previousSessionId,
    })
    .eq("id", sessionId);

  // 3. Destination charge: Stripe moves amount − fee to the mentor the moment the charge succeeds.
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amount,
            product_data: { name: `60-minute session${mentorName ? ` with ${mentorName}` : ""}` },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: { destination: mentor.stripe_account_id },
        metadata: { session_id: sessionId },
      },
      metadata: { session_id: sessionId, mentor_id: slot.mentor_id, learner_id: learnerId },
      customer_email: session.user.email,
      success_url: `${process.env.BETTER_AUTH_URL}/dashboard?booked=1`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/mentors`,
    });

    await supabaseAdmin.from("mentor_sessions").update({ stripe_checkout_id: checkout.id }).eq("id", sessionId);
    return NextResponse.json({ sessionId, checkoutUrl: checkout.url });
  } catch (err) {
    // Don't leave the slot locked for 35 minutes behind a failed Checkout.
    console.error("Checkout creation failed:", err);
    await supabaseAdmin.rpc("release_session", { p_session_id: sessionId });
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
