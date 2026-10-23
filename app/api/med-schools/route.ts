import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";
import { isPlus } from "@/lib/auth/role";
import { SCHOOL_STAGES } from "@/features/portfolio/components/data/portfolio-options";

const stage = z.enum(SCHOOL_STAGES.map((s) => s.value) as [string, ...string[]]);
const add = z.object({ school: z.string().trim().min(1).max(120) });
const move = z.object({ id: z.uuid(), stage });
const remove = z.object({ id: z.uuid() });

/** The learner's UCAS choices. Every query is scoped to their own rows. */
export async function GET(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("med_school_applications")
    .select("id, school, stage")
    .eq("user_id", guard.session.user.id)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ schools: data });
}

export async function POST(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!(await isPlus(guard.session.user.id))) return NextResponse.json({ error: "plus_required" }, { status: 402 });
  const parsed = add.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { error } = await supabaseAdmin
    .from("med_school_applications")
    .insert({ user_id: guard.session.user.id, school: parsed.data.school });
  if (error) {
    const dup = error.code === "23505";
    return NextResponse.json({ error: dup ? "already_added" : error.message }, { status: dup ? 409 : 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = move.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { error } = await supabaseAdmin
    .from("med_school_applications")
    .update({ stage: parsed.data.stage })
    .eq("id", parsed.data.id)
    .eq("user_id", guard.session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = remove.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const { error } = await supabaseAdmin
    .from("med_school_applications")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", guard.session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
