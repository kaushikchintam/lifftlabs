import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const VALID_CADENCE = ["monthly", "yearly"] as const;

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("income_sources")
        .select("id, label, amount_pence, cadence, status_tag, description")
        .eq("user_id", guard.session.user.id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.label?.trim() || !body?.amountPence || !VALID_CADENCE.includes(body?.cadence)) {
        return NextResponse.json({ error: "label, amountPence, and a valid cadence are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("income_sources")
        .insert({
            user_id: guard.session.user.id,
            label: body.label.trim(),
            amount_pence: Math.round(Number(body.amountPence)),
            cadence: body.cadence,
            status_tag: body.statusTag?.trim() || null,
            description: body.description?.trim() || null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source: data }, { status: 201 });
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
        .from("income_sources")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
