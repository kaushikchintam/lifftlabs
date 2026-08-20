import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

interface CreateRotationBody {
    specialty: string;
    start_date: string;
    end_date?: string;
    is_genuine_interest?: boolean;
}

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("clinical_rotations")
        .select("id, specialty, start_date, end_date, is_genuine_interest")
        .eq("user_id", guard.session.user.id)
        .order("start_date", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rotations: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: CreateRotationBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!body.specialty?.trim() || !body.start_date) {
        return NextResponse.json({ error: "specialty and start_date are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("clinical_rotations")
        .insert({
            user_id: guard.session.user.id,
            specialty: body.specialty.trim(),
            start_date: body.start_date,
            end_date: body.end_date || null,
            is_genuine_interest: body.is_genuine_interest ?? false,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rotation: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "id_required" }, { status: 400 });
    }

    const { data: deleted, error } = await supabaseAdmin
        .from("clinical_rotations")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
