import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("transition_costs")
        .select("id, label, amount_pence, is_paid, due_note")
        .eq("user_id", guard.session.user.id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ costs: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.label?.trim() || !body?.amountPence) {
        return NextResponse.json({ error: "label and amountPence are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("transition_costs")
        .insert({
            user_id: guard.session.user.id,
            label: body.label.trim(),
            amount_pence: Math.round(Number(body.amountPence)),
            due_note: body.dueNote?.trim() || null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cost: data }, { status: 201 });
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
    if (typeof body?.isPaid !== "boolean") {
        return NextResponse.json({ error: "isPaid_required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("transition_costs")
        .update({ is_paid: body.isPaid })
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select()
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ cost: data });
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
        .from("transition_costs")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
