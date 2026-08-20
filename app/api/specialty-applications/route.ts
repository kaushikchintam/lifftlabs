// GET/POST/DELETE/PATCH(inline status drop-down)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const VALID_STATUSES = [
    "portfolio_building",
    "application_submitted",
    "interview_invited",
    "ranked_offer",
] as const;

interface CreateApplicationBody {
    specialty: string;
    status?: string;
    target_year?: number;
    notes?: string;
}

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("specialty_applications")
        .select("id, specialty, status, target_year, notes, created_at")
        .eq("user_id", guard.session.user.id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: CreateApplicationBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!body.specialty?.trim()) {
        return NextResponse.json({ error: "specialty_required" }, { status: 400 });
    }

    if (body.status && !VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("specialty_applications")
        .insert({
            user_id: guard.session.user.id,
            specialty: body.specialty.trim(),
            status: body.status ?? "portfolio_building",
            target_year: body.target_year ?? null,
            notes: body.notes?.trim() || null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "id_required" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.status || !VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("specialty_applications")
        .update({ status: body.status })
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select()
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ application: data });
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
        .from("specialty_applications")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
