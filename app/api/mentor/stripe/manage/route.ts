import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/mentor/stripe/manage — mints a one-time login link to the
 * mentor's Stripe Express Dashboard (payout history, bank detail changes).
 * Bank details stay outsourced to Stripe forever — LIFFT never touches them.
 */
export async function POST(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("stripe_account_id")
    .eq("user_id", guard.session.user.id)
    .maybeSingle();

  if (!mentor?.stripe_account_id) {
    return NextResponse.json({ error: "no_stripe_account" }, { status: 404 });
  }

  try {
    const link = await stripe.accounts.createLoginLink(
      mentor.stripe_account_id
    );
    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("login link failed:", err);
    return NextResponse.json({ error: "link_failed" }, { status: 502 });
  }
}