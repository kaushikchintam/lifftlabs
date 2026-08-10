import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * POST /api/checklist/steps/[id]/notes — create a note under a step.
 * Capped at 7 notes per step (checked here, not in the DB).
 */

const MAX_NOTES_PER_STEP = 7;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = guard.session.user.id;
  const { id: stepId } = await params;

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { content } = body;
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  // Ownership check on the parent step before creating a note under it.
  const { data: step } = await supabaseAdmin
    .from("checklist_steps")
    .select("id")
    .eq("id", stepId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!step) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { count, error: countError } = await supabaseAdmin
    .from("checklist_notes")
    .select("id", { count: "exact", head: true })
    .eq("step_id", stepId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if ((count ?? 0) >= MAX_NOTES_PER_STEP) {
    return NextResponse.json({ error: "note_limit_reached" }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin
    .from("checklist_notes")
    .insert({ step_id: stepId, user_id: userId, content: content.trim() })
    .select("id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}
