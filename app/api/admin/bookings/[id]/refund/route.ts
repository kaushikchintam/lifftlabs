import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/admin/bookings/[id]/refund — full refund. reverse_transfer pulls the
 * mentor's share back, refund_application_fee returns LIFFT's fee.
 * The charge.refunded webhook cancels the session and frees the slot.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: guard.status });

  const { id } = await params;
  const { data: s } = await supabaseAdmin
    .from("mentor_sessions")
    .select("stripe_payment_intent_id, refunded_at")
    .eq("id", id)
    .maybeSingle();
  if (!s?.stripe_payment_intent_id) return NextResponse.json({ error: "not_paid" }, { status: 404 });
  if (s.refunded_at) return NextResponse.json({ ok: true });

  try {
    await stripe.refunds.create(
      { payment_intent: s.stripe_payment_intent_id, reverse_transfer: true, refund_application_fee: true },
      { idempotencyKey: `refund-${id}` }
    );
  } catch (err) {
    console.error("[refund] failed:", err);
    return NextResponse.json({ error: "refund_failed" }, { status: 502 });
  }
  await supabaseAdmin.from("mentor_sessions").update({ refunded_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json({ ok: true });
}
