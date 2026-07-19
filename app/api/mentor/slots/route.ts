import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * Mentor slot publishing (P3-07, explicit-slot model).
 *
 * POST /api/mentor/slots — publish a bookable slot
 * GET  /api/mentor/slots — list own slots (all statuses, future first)
 *
 * No minimum-notice rule (product decision): mentors can publish slots
 * starting any time in the future, and learners can book them immediately.
 * Slots are validated against Google Calendar blockers at publish time; the
 * DB exclusion constraint (no_overlapping_active_slots) is the final guard.
 */

const publishSchema = z.object({
  startsAt: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().min(30).max(120),
});

async function getMentorProfile(userId: string) {
  const { data } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function POST(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mentor = await getMentorProfile(guard.session.user.id);
  if (!mentor) {
    return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });
  }

  let body: z.infer<typeof publishSchema>;
  try {
    body = publishSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const start = new Date(body.startsAt);
  const end = new Date(start.getTime() + body.durationMinutes * 60 * 1000);

  // Only rule: slots must start in the future.
  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: "in_the_past" }, { status: 422 });
  }

  const slotRange = `[${start.toISOString()},${end.toISOString()})`;

  // Reject slots colliding with Google Calendar blockers. Write-back echoes
  // (lifft_session_id set) are included deliberately — they represent booked
  // LIFFT sessions, which are just as unavailable.
  const { data: collisions } = await supabaseAdmin
    .from("google_calendar_blockers")
    .select("id")
    .eq("mentor_id", mentor.user_id)
    .overlaps("blocker_range", slotRange)
    .limit(1);

  if (collisions && collisions.length > 0) {
    return NextResponse.json({ error: "conflicts_with_calendar" }, { status: 409 });
  }

  const { data: slot, error } = await supabaseAdmin
    .from("mentor_open_slots")
    .insert({ mentor_id: mentor.user_id, slot_range: slotRange })
    .select("id, slot_range, status, created_at")
    .single();

  if (error) {
    // 23P01 = exclusion_violation: overlaps another active slot
    if (error.code === "23P01") {
      return NextResponse.json({ error: "overlaps_existing_slot" }, { status: 409 });
    }
    console.error("slot insert failed:", error);
    return NextResponse.json({ error: "publish_failed" }, { status: 500 });
  }

  return NextResponse.json({ slot }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const mentor = await getMentorProfile(guard.session.user.id);
  if (!mentor) {
    return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });
  }

  const { data: slots, error } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("id, slot_range, status, created_at")
    .eq("mentor_id", mentor.user_id)
    .order("slot_range", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  return NextResponse.json({ slots });
}