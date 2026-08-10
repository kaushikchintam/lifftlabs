import {NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * PATCH(inline title rename), DELETE a section (cascades to its items/sub-items)
 */


//Patch handler for inline title rename
export async function PATCH (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;
    const { id } = await params;

    const body = await request.json();

    //Defensive check for title
    if (!body.title || typeof body.title !== 'string') {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("checklist_sections")
      .update({ title: body.title })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, title")
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    return NextResponse.json({ section: data });
}

//DELETE Handler (Relies on Database Cascade)
export async function DELETE (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;
    const { id } = await params;

    const { data: deleted, error } = await supabaseAdmin
      .from("checklist_sections")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    if (!deleted) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}