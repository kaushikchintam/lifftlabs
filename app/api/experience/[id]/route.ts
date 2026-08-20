//GET (detail), PATCH if you want editing
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

// experience_attachments has ON DELETE CASCADE on experience_id, so removing
// the log row clears its attachment rows too — storage objects are left
// behind, same as every other attachments table in this codebase does.
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: deleted, error } = await supabaseAdmin
        .from("experience_log")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
