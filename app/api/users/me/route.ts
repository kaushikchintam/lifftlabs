import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * /api/users/me — the current user's own profile.
 * GET  → user basics + role-specific profile
 * PATCH → update name and the editable fields for the caller's role.
 * Identity is ALWAYS the session's — no ids accepted from the request.
 */

const learnerSchema = z.object({
  name: z.string().min(1).max(100),
  current_position: z.string().max(200).optional(),
  target_role: z.string().max(200).optional(),
  linkedin_url: z.string().url().max(300).optional().or(z.literal("")),
});

const mentorSchema = z.object({
  name: z.string().min(1).max(100),
  one_liner: z.string().max(300).optional(),
  current_position: z.string().max(200).optional(),
  specialty: z.string().max(100).optional(),
  hourly_rate_pounds: z.number().int().min(10).max(500).optional(),
});

export async function GET(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = guard.session.user.id;

  const { data: mentorProfile } = await supabaseAdmin
    .from("mentor_profiles")
    .select("one_liner, current_position, specialty, hourly_rate_pence, charges_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: learnerProfile } = mentorProfile
    ? { data: null }
    : await supabaseAdmin
        .from("learner_profiles")
        .select("current_position, target_role, linkedin_url")
        .eq("user_id", userId)
        .maybeSingle();

  return NextResponse.json({
    user: {
      name: guard.session.user.name ?? "",
      email: guard.session.user.email,
      image: guard.session.user.image ?? null,
    },
    role: mentorProfile ? "mentor" : "learner",
    mentorProfile,
    learnerProfile,
  });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = guard.session.user.id;

  const { data: mentor } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (mentor) {
    const parsed = mentorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const { name, one_liner, current_position, specialty, hourly_rate_pounds } =
      parsed.data;

    await supabaseAdmin.from("user").update({ name }).eq("id", userId);
    const { error } = await supabaseAdmin
      .from("mentor_profiles")
      .update({
        ...(one_liner !== undefined ? { one_liner } : {}),
        ...(current_position !== undefined ? { current_position } : {}),
        ...(specialty !== undefined ? { specialty: [specialty] } : {}),
        ...(hourly_rate_pounds !== undefined
          ? { hourly_rate_pence: hourly_rate_pounds * 100 }
          : {}),
      })
      .eq("user_id", userId);
    if (error) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }
  } else {
    const parsed = learnerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const { name, current_position, target_role, linkedin_url } = parsed.data;

    await supabaseAdmin.from("user").update({ name }).eq("id", userId);
    const { error } = await supabaseAdmin
      .from("learner_profiles")
      .update({
        ...(current_position !== undefined ? { current_position } : {}),
        ...(target_role !== undefined ? { target_role } : {}),
        ...(linkedin_url !== undefined
          ? { linkedin_url: linkedin_url || null }
          : {}),
      })
      .eq("user_id", userId);
    if (error) {
      return NextResponse.json({ error: "update_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}