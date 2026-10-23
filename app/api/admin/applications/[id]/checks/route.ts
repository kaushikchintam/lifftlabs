import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

const schema = z.object({
  key: z.enum(["identity", "registration", "insurance", "references"]),
  done: z.boolean(),
});

/** POST /api/admin/applications/[id]/checks — tick/untick one vetting check, recording who. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: guard.status });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { id } = await params;
  const { data: app } = await supabaseAdmin.from("mentor_applications").select("checks").eq("id", id).maybeSingle();
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // ponytail: read-modify-write; two admins ticking the same card in the same second can lose one tick
  const checks = { ...(app.checks as Record<string, unknown>) };
  if (parsed.data.done) checks[parsed.data.key] = { by: guard.session.user.email, at: new Date().toISOString() };
  else delete checks[parsed.data.key];

  const { error } = await supabaseAdmin.from("mentor_applications").update({ checks }).eq("id", id);
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ checks });
}
