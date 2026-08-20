//DELETE (removes both the Storage object and its row)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function DELETE (
    request: NextRequest,
    { params } : { params : Promise<{id: string; attachmentId: string}> }
    ) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401})
    }

    const userId = guard.session.user.id;
    const { attachmentId } = await params;

    const { data: deleted, error } = await supabaseAdmin
      .from("experience_attachments")
      .delete()
      .eq("id", attachmentId)
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