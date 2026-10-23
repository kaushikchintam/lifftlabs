import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const schema = z.object({ archived: z.boolean() });

/** POST /api/conversations/[id]/archive — per person; the other side is unaffected. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("conversation_participants")
    .update({ archived_at: parsed.data.archived ? new Date().toISOString() : null })
    .eq("conversation_id", id)
    .eq("user_id", guard.session.user.id)
    .select("conversation_id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
