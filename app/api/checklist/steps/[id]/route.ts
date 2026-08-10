import {NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * PATCH (title rename, status toggle), DELETE (cascades to its notes)
 */

export async function PATCH (request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;

    const { id } = await params;
    const body = await request.json();

    //Dynamically build the update object based on what was sent
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) {
        if (typeof body.title !== 'string' || body.title.trim() === '') {
            return NextResponse.json({ error: 'Invalid title format' }, { status: 400 });
        }
        updateData.title = body.title;
    } 

    const VALID_STATUSES = ["todo", "in_progress", "done"];
    if (body.status !== undefined) {
        if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        updateData.status = body.status;
    }

    //Guard clause: Error if neither property was provided
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No fields to update provided' }, { status: 400 });
    }

    //Execute partial update in DB
    const { data, error } =  await supabaseAdmin
      .from("checklist_steps")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, title, status")
      .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ step: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, {status: 401 } );
    }
    const userId = guard.session.user.id;

    const { id } = await params;

    const { data: deleted, error } = await supabaseAdmin
      .from("checklist_steps")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!deleted) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}