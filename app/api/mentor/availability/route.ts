import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * /api/mentor/availability — weekly hours (UK time, whole hours).
 * Every change rebuilds the next 14 days of open slots; held/booked slots
 * are never touched (regenerate_open_slots).
 */

const addSchema = z
  .object({
    day: z.number().int().min(0).max(6), // 0 = Sunday
    start: z.number().int().min(0).max(23),
    end: z.number().int().min(1).max(23), // time has no 24:00
  })
  .refine((v) => v.end > v.start);

const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

async function mentorOf(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return null;
  const { data } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", guard.session.user.id)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function regenerate(mentorId: string) {
  const { error } = await supabaseAdmin.rpc("regenerate_open_slots", { p_mentor_id: mentorId });
  if (error) console.error("[availability] regenerate failed:", error);
}

export async function POST(request: NextRequest) {
  const mentorId = await mentorOf(request);
  if (!mentorId) return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });

  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_hours" }, { status: 400 });
  const { day, start, end } = parsed.data;

  const { error } = await supabaseAdmin.from("mentor_availability").insert({
    mentor_id: mentorId,
    day_of_week: day,
    start_time: hh(start),
    end_time: hh(end),
  });
  // 23P01 = exclusion violation (overlap), 23505 = same start twice
  if (error?.code === "23P01" || error?.code === "23505") {
    return NextResponse.json({ error: "overlaps" }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });

  await regenerate(mentorId);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const mentorId = await mentorOf(request);
  if (!mentorId) return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("mentor_availability").delete().eq("id", id).eq("mentor_id", mentorId);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });

  await regenerate(mentorId);
  return NextResponse.json({ ok: true });
}
