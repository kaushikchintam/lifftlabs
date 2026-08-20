/*
GET /api/gibbs?pending=true - the completed but unreflected sessions, for the banner. Needs mentor name + scheduled_at
for the "Session with {mentor_name} · Wed 11:00" line, so it joins mentor_sessions -> user on mentor_id. 
**/

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET (request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }

    const userId = guard.session.user.id;

    const { data: sessions, error: sessionsError } = await supabaseAdmin 
      .from("mentor_sessions")
      .select("id, mentor_id, scheduled_at")
      .eq("learner_id", userId)
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false })

    if (sessionsError) {
        return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    if (!sessions || sessions.length === 0) {
        return NextResponse.json({ pending: [] });
    }

    const { data: reflected, error: reflectedError } = await supabaseAdmin
      .from("gibbs_reflections")
      .select("session_id")
      .eq("user_id", userId)
      .not("session_id", "is", null);
      
      if (reflectedError) {
        return NextResponse.json({ error: reflectedError.message }, { status: 500 });
      }

      const reflectedIds = new Set((reflected ?? []).map((r) => r.session_id));
      const unreflected = sessions.filter((s) => !reflectedIds.has(s.id));

      if (unreflected.length === 0) {
        return NextResponse.json({ pending: [] });
        }

      const mentorIds = [...new Set(unreflected.map((s) => s.mentor_id))];

      const { data: mentors, error: mentorsError } = await supabaseAdmin
        .from("user")
        .select("id, name")
        .in("id", mentorIds);

      if (mentorsError) {
        return NextResponse.json({ error: mentorsError.message }, { status: 500 });
      }
      
      const mentorNames = new Map((mentors ?? []).map((m) => [m.id, m.name]));

      const pending = unreflected.map((s) => ({
        session_id: s.id, 
        mentor_name: mentorNames.get(s.mentor_id) ?? "your mentor",
        scheduled_at: s.scheduled_at, 
      }));

      return NextResponse.json({ pending });
}