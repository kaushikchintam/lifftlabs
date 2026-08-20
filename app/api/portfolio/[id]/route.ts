import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";
import { PORTFOLIO_TYPES, type PortfolioCategory } from "@/features/portfolio/components/data/portfolio-options";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("portfolio_entries")
        .select()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ entry: data });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    // "Mark signed off" is the only edit the mockup shows as a distinct
    // action — self-attested by the learner, no separate mentor-approval
    // flow exists anywhere else in this codebase to hang a real reviewer
    // off of. Worth revisiting if that changes.
    if (body.sign_off === true) {
        const { data, error } = await supabaseAdmin
            .from("portfolio_entries")
            .update({ signed_off_at: new Date().toISOString(), signed_off_by: userId })
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
        return NextResponse.json({ entry: data });
    }

    const { category, type, title, organisation, linked_specialty, start_date, end_date, reflection } = body;

    if (category && type) {
        const allowedTypes = PORTFOLIO_TYPES[category as PortfolioCategory]?.map((t) => t.value) ?? [];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: "invalid_type_for_category" }, { status: 400 });
        }
    }

    const { data, error } = await supabaseAdmin
        .from("portfolio_entries")
        .update({
            ...(category && { category }),
            ...(type && { type }),
            ...(title && { title: title.trim() }),
            ...(organisation && { organisation: organisation.trim() }),
            ...(linked_specialty !== undefined && { linked_specialty: linked_specialty?.trim() || null }),
            ...(start_date && { start_date }),
            ...(end_date !== undefined && { end_date: end_date || null }),
            ...(reflection && { reflection: reflection.trim() }),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ entry: data });
}

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
        .from("portfolio_entries")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
