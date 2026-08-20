import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ attachmentId: string }> }
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { attachmentId } = await params;

    const { data: deleted, error } = await supabaseAdmin
        .from("portfolio_attachments")
        .delete()
        .eq("id", attachmentId)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
