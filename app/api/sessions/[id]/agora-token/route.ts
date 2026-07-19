import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";
import { buildRtcToken, deterministicUid } from "@/lib/agora/token";

/**
 * GET /api/sessions/[id]/agora-token (P5-01)
 *
 * Three checks, all mandatory:
 *   1. authenticated
 *   2. participant of THIS session (channel name = session id is guessable
 *      from booking history — participant gating is the real lock)
 *   3. inside the join window: 15 min before start → end + 30 min grace
 *
 * Token TTL runs to end + 30 min, so a token fetched at page load (P5-03
 * pre-fetch) outlives the whole session. The client still wires
 * onTokenPrivilegeWillExpire → refetch, covering edge cases.
 */

const JOIN_OPENS_BEFORE_MS = 15 * 60 * 1000;
const GRACE_AFTER_END_MS = 30 * 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: s } = await supabaseAdmin
    .from("mentor_sessions")
    .select("id, mentor_id, learner_id, scheduled_at, ends_at, status")
    .eq("id", id)
    .maybeSingle();

  // Non-participants get the same 404 as nonexistence — no probing.
  if (
    !s ||
    (s.mentor_id !== guard.session.user.id &&
      s.learner_id !== guard.session.user.id)
  ) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (s.status !== "confirmed") {
    return NextResponse.json({ error: "session_not_joinable" }, { status: 409 });
  }

  const now = Date.now();
  const opens = new Date(s.scheduled_at).getTime() - JOIN_OPENS_BEFORE_MS;
  const closes = new Date(s.ends_at).getTime() + GRACE_AFTER_END_MS;
  if (now < opens || now > closes) {
    return NextResponse.json({ error: "outside_join_window" }, { status: 409 });
  }

  const uid = deterministicUid(guard.session.user.id);
  const token = buildRtcToken({
    channel: s.id, // session id doubles as the Agora channel name (schema convention)
    uid,
    expiresAt: new Date(closes),
  });

  return NextResponse.json({
    token,
    uid,
    channel: s.id,
    appId: process.env.AGORA_APP_ID,
  });
}