import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const schema = z.object({ paused: z.boolean() });

/** POST /api/admin/mentors/[id]/pause — the team hides/shows a mentor in matching. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: guard.status });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { id } = await params;
  const { error } = await supabaseAdmin.from("mentor_profiles").update({ paused: parsed.data.paused }).eq("user_id", id);
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
