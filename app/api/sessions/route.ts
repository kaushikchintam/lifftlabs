import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Stripe Checkout's expires_at has a hard MINIMUM of 30 minutes.
 *  The DB hold must outlive the checkout page, hence 35. Do not shorten the
 *  hold without also building a refund path for payments that complete after
 *  the slot was released. */
const CHECKOUT_EXPIRY_MINUTES = 30;
const HOLD_MINUTES = 35;

/** Fallback if mentor_profiles has no rate set. Pence. */
const DEFAULT_SESSION_PRICE_PENCE = 4000;

/** Platform cut, percent. Keep in step with the earnings page. */
const PLATFORM_FEE_PERCENT = 15;

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let slotId: string | undefined;
  try {
    ({ slotId } = await request.json());
  } catch {
    /* fall through to the 400 below */
  }
  if (!slotId) {
    return NextResponse.json({ error: "slotId required" }, { status: 400 });
  }

  // 1. Load slot + mentor BEFORE holding — the payment-readiness gate
  //    (P4-01) must refuse before we lock the slot for 35 minutes.
  const { data: slot } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, mentor_id, status")
    .eq("id", slotId)
    .maybeSingle();

  if (!slot || slot.status !== "open") {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  const { data: mentorProfile } = await supabaseAdmin
    .from("mentor_profiles")
    .select("hourly_rate_pence, stripe_account_id, charges_enabled")
    .eq("user_id", slot.mentor_id)
    .maybeSingle();

  if (!mentorProfile?.charges_enabled || !mentorProfile.stripe_account_id) {
    // Slots shouldn't be visible pre-verification (the slots endpoint hides
    // them), but a direct POST must be refused too.
    return NextResponse.json({ error: "mentor_not_bookable" }, { status: 403 });
  }

  const { data: mentorUser } = await supabaseAdmin
    .from("user")
    .select("name")
    .eq("id", slot.mentor_id)
    .single();

  // PRICING ASSUMPTION: hourly_rate_pence is charged per SESSION, which is
  // correct while all published slots are 60 minutes. If shorter/longer
  // slots are ever allowed, pro-rate here from the slot's duration —
  // otherwise a 30-minute slot silently charges the full hourly rate.
  const pricePence =
    mentorProfile.hourly_rate_pence ?? DEFAULT_SESSION_PRICE_PENCE;

  // 2. Atomically hold the slot + create the pending session.
  //    hold_slot derives mentor_id and times from the slot row (never from
  //    the caller), raises 'slot_unavailable' if it's gone, and the exclusion
  //    constraint on mentor_sessions backstops any race.
  const { data: sessionId, error: holdError } = await supabaseAdmin.rpc(
    "hold_slot",
    {
      p_slot_id: slotId,
      p_learner_id: session.user.id,
      p_hold_minutes: HOLD_MINUTES,
    }
  );

  if (holdError || !sessionId) {
    const gone =
      holdError?.message?.includes("slot_unavailable") ||
      holdError?.message?.includes("no_overlapping_sessions");
    return NextResponse.json(
      { error: gone ? "slot_unavailable" : "booking_failed" },
      { status: gone ? 409 : 500 }
    );
  }

  // P6-03: conversation exists from first booking, idempotent by RPC design
  // Executed as a non-blocking background promise so it won't delay Stripe Checkout.
  supabaseAdmin
    .rpc("get_or_create_conversation", {
      p_user_a: slot.mentor_id,
      p_user_b: session.user.id,
    })
    .then(({ error }) => {
      if (error) {
        console.error("conversation create failed:", error);
      }
    });

  // 3. Stripe Checkout — destination charge to the mentor's Express account.
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at:
        Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_MINUTES * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: pricePence,
            product_data: {
              name: `Mentoring session${
                mentorUser?.name ? ` with ${mentorUser.name}` : ""
              }`,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(
          (pricePence * PLATFORM_FEE_PERCENT) / 100
        ),
        transfer_data: {
          destination: mentorProfile.stripe_account_id,
        },
      },
      metadata: {
        session_id: sessionId,
        mentor_id: slot.mentor_id,
        learner_id: session.user.id,
      },
      customer_email: session.user.email ?? undefined,
      success_url: `${process.env.BETTER_AUTH_URL}/sessions/${sessionId}?payment=success`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/sessions/${sessionId}?payment=cancelled`,
    });

    await supabaseAdmin
      .from("mentor_sessions")
      .update({ stripe_checkout_id: checkout.id })
      .eq("id", sessionId);

    return NextResponse.json({ sessionId, checkoutUrl: checkout.url });
  } catch (err) {
    // Checkout creation failed: release the hold immediately rather than
    // leaving the slot locked for 35 minutes.
    console.error("Checkout creation failed:", err);
    await supabaseAdmin.rpc("release_session", { p_session_id: sessionId });
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }
}
