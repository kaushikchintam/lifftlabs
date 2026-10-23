import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const schema = z.object({ paused: z.boolean() });

/** POST /api/mentor/pause — mentor hides/shows themselves in matching. Booked sessions stay. */
export async function POST(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("mentor_profiles")
    .update({ paused: parsed.data.paused })
    .eq("user_id", guard.session.user.id)
    .select("user_id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_a_mentor" }, { status: 403 });
  return NextResponse.json({ ok: true });
}
