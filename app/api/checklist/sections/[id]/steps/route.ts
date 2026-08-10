import {NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * POST (create a step under a section)
 */

export async function POST (request: NextRequest, { params }: { params: Promise<{ id: string }> })
 { 
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;
    const { id: sectionId } = await params;

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

    // Ownership check on the parent section before creating a step under it.
    const { data: section } = await supabaseAdmin
      .from("checklist_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!section) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("checklist_steps")
      .insert({ section_id: sectionId, user_id: userId, title: title.trim() })
      .select("id, title")
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    return NextResponse.json({ step: data }, { status: 201 });
}