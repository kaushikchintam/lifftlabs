//PATCH (create-or-update the one reflection field)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function PATCH (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "Unauthorized", status: 401 });
    }
    const userId = guard.session.user.id;
    const { id } = await params;

    let body: { reflection?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (typeof body.reflection !== "string") {
        return NextResponse.json({ error: "reflection_required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("experience_log")
      .update({ reflection: body.reflection })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, reflection")
      .maybeSingle();
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    
    return NextResponse.json({ reflection: data.reflection });
}