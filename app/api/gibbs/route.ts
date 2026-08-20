//GET -> the journal list
//POST -> creates a reflection. Two shapes: { session_id, description, feelings, ... } when answering a prompt, or { title, description, feelings, ...} when starting a custom one from the journal page.
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

interface RefSession {
    session_id: string,
    description: string,
    feelings: string,
    evaluation: string,
    analysis: string,
    conclusion: string,
    action_plan: string
}

interface RefCustom {
    title: string,
    description: string,
    feelings: string,
    evaluation: string,
    analysis: string,
    conclusion: string,
    action_plan: string
}

export async function GET (request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const userId = guard.session.user.id;

    const { data, error } = await supabaseAdmin
      .from("gibbs_reflections")
      .select(`
        id, session_id, title, description, feelings, evaluation, analysis, conclusion, action_plan, created_at, updated_at`)
      .eq("user_id", userId)
      .order("created_at")

    if (error) {
        return NextResponse.json( { error: "invalid"}, { status: 500 });
    }

    const reflections = data ?? [];
    const sessionIds = [...new Set(reflections.map((r) => r.session_id).filter((id): id is string => !!id))];

    if (sessionIds.length === 0) {
        return NextResponse.json({ reflections });
    }

    // Session-based reflections don't carry the mentor's name, so join it
    // in here the same way /pending does for the banner.
    const { data: sessions } = await supabaseAdmin
      .from("mentor_sessions")
      .select("id, mentor_id")
      .in("id", sessionIds);

    const mentorIds = [...new Set((sessions ?? []).map((s) => s.mentor_id))];
    const { data: mentors } = await supabaseAdmin
      .from("user")
      .select("id, name")
      .in("id", mentorIds.length > 0 ? mentorIds : [""]);

    const mentorNameBySessionId = new Map(
      (sessions ?? []).map((s) => [s.id, (mentors ?? []).find((m) => m.id === s.mentor_id)?.name ?? "your mentor"])
    );

    const withMentorNames = reflections.map((r) => ({
        ...r,
        mentor_name: r.session_id ? mentorNameBySessionId.get(r.session_id) ?? "your mentor" : null,
    }));

    return NextResponse.json({ reflections: withMentorNames });
}

export async function POST (request: NextRequest) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized "}, { status: 401 });
    }

    const userId = guard.session.user.id;

    try {
        let body: RefSession | RefCustom = await request.json();

        if ('session_id' in body) {
            // Ownership check on the session before attaching a reflection to it.
            const { data: session } = await supabaseAdmin
              .from("mentor_sessions")
              .select("id")
              .eq("id", body.session_id)
              .eq("learner_id", userId)
              .maybeSingle();

            if (!session) {
                return NextResponse.json({ error: "not_found" }, { status: 404 });
            }

            const { data, error } = await supabaseAdmin
              .from("gibbs_reflections")
              .insert({
               user_id: userId,
               session_id: body.session_id,
               description: body.description,
               feelings: body.feelings,
               evaluation: body.evaluation,
               analysis: body.analysis,
               conclusion: body.conclusion,
               action_plan: body.action_plan
            })
            .select()
            .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ reflection: data }, { status: 201 });
        }

        else if ('title' in body) {
            const { data, error } = await supabaseAdmin
              .from("gibbs_reflections")
              .insert({
               user_id: userId,
               title: body.title,
               description: body.description,
               feelings: body.feelings,
               evaluation: body.evaluation,
               analysis: body.analysis,
               conclusion: body.conclusion,
               action_plan: body.action_plan
            })
            .select()
            .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ reflection: data }, { status: 201 });
        }

        else {
            return NextResponse.json({ error: 'Invalid payload structure'}, { status: 400 });
        }

    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

}
