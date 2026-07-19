import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * GET /api/mentor/blockers — the logged-in mentor's own busy blocks for the
 * next 7 days, for the calendar page's week view. Times only, never event
 * details (we don't store them). LIFFT write-back echoes are flagged so the
 * UI can label them "LIFFT session" instead of "busy".
 */

export async function GET(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const weekOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("google_calendar_blockers")
    .select("id, blocker_range, lifft_session_id")
    .eq("mentor_id", guard.session.user.id)
    .overlaps("blocker_range", `[${now},${weekOut})`)
    .order("blocker_range", { ascending: true })
    .limit(200);

  if (error) {
    console.error("blockers fetch failed:", error);
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }

  return NextResponse.json({
    blockers: (data ?? []).map((b) => ({
      id: b.id,
      range: b.blocker_range,
      isLifftSession: b.lifft_session_id !== null,
    })),
  });
}