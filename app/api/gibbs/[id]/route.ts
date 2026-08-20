/**
 * GET + PATCH + DELETE - reopen an existing reflection to keep editing it (the modal should support loading a draft 
back in, not just one-shot save), and delete. 
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET (request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }
    const userId = guard.session.user.id;

    const { id } = await params;

    const { data, error } = await supabaseAdmin 
      .from("gibbs_reflections")
      .select("id, session_id, title, description, feelings, evaluation, analysis, conclusion, action_plan, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ reflection: data })

}

//PATCH
export async function PATCH (request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }
    const userId = guard.session.user.id;   
    const { id } = await params;
    const body = await request.json();

    const updateData: { title?: string; description?: string; feelings?: string; evaluation?: string; analysis?: string; conclusion?: string; action_plan?: string; } = {};

    if (body.title !== undefined) {
        if (typeof body.title !== "string" || !body.title.trim()){
            return NextResponse.json({ error: "invalid title format" }, { status: 400 });
        }
        updateData.title = body.title;
    }

    if (body.description !== undefined) updateData.description = body.description;
    if (body.feelings !== undefined) updateData.feelings = body.feelings;
    if (body.evaluation !== undefined) updateData.evaluation = body.evaluation; 
    if (body.analysis !== undefined) updateData.analysis = body.analysis;
    if (body.conclusion !== undefined) updateData.conclusion = body.conclusion;
    if (body.action_plan !== undefined) updateData.action_plan = body.action_plan;
    
    //empty update guard
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No fields to update provided'}, { status: 400 });
    }

    //Execute partial update in DB
    const { data, error } = await supabaseAdmin
      .from("gibbs_reflections")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, session_id, title, description, feelings, evaluation, analysis, conclusion, action_plan, created_at, updated_at")
      .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500});
    }  

    if(!data) {
        return NextResponse.json({ error: "not_found"}, { status: 404 });
    }

    return NextResponse.json({ reflection: data });
    
}

//DELETE
export async function DELETE (
    request: NextRequest, 
    { params }: { params: Promise<{id: string}>} 
) {
    const guard = await requireSession(request.headers);
    if(!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }
    const userId = guard.session.user.id;
    const { id } = await params;
    
    const { data: deleted, error } = await supabaseAdmin
      .from("gibbs_reflections")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500})
    }

    if (!deleted) {
        return NextResponse.json({ error: "not_found"}, { status: 404 });
    }

    return NextResponse.json({ success: true });
}