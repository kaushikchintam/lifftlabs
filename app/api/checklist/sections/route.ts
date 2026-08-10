import {NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * GET(the whole tree in one call: sections -> steps -> notes), POST (create a section).
 */

export async function GET (request: NextRequest) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;

    const { data, error } = await supabaseAdmin
      .from("checklist_sections")
      .select(`
        id, title,
        checklist_steps (
          id, title, status,
          checklist_notes (id, content, created_at )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .order("created_at", { referencedTable: "checklist_steps", ascending: true })
      .order("created_at", { referencedTable: "checklist_steps.checklist_notes", ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    return NextResponse.json({ sections: data ?? [] });
}

export async function POST (request: NextRequest) {

    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;
    
    let body: { title?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid body"}, { status: 400 });
    }

    const { title } = body;
    
    if (!title || typeof title!=="string" || !title.trim()) {
        return NextResponse.json({ error: "title required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("checklist_sections")
      .insert({ user_id: userId, title: title.trim() })
      .select("id, title")
      .single(); 

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    return NextResponse.json({ section: data }, { status: 201 });
} 