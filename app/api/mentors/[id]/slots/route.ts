import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * GET /api/mentors/[id]/slots — a mentor's bookable slots, for the learner
 * booking UI (P3-08).
 *
 * Only status='open', only slots that haven't started yet (no minimum-notice
 * rule — product decision), and only when the mentor is payment-ready
 * (charges_enabled, P4-01).
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: mentorId } = await params;

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id, hourly_rate_pence, charges_enabled")
    .eq("user_id", mentorId)
    .maybeSingle();

  if (!mentor) {
    return NextResponse.json({ error: "mentor_not_found" }, { status: 404 });
  }

  // P4-01 gate: not payment-ready → nothing to book.
  if (!mentor.charges_enabled) {
    return NextResponse.json({
      slots: [],
      pricePence: mentor.hourly_rate_pence,
      bookable: false,
    });
  }

  // Exclude slots that have already started; everything else is bookable now.
  const earliestBookable = new Date().toISOString();

  const { data: slots, error } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, slot_range")
    .eq("mentor_id", mentorId)
    .eq("status", "open")
    .gt("slot_range", `[${earliestBookable},${earliestBookable}]`)
    .order("slot_range", { ascending: true })
    .limit(100);

  if (error) {
    console.error("open slots fetch failed:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  return NextResponse.json({
    slots: slots ?? [],
    pricePence: mentor.hourly_rate_pence,
    bookable: true,
  });
}