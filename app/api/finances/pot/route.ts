import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("finance_pot_contributions")
        .select("amount_pence")
        .eq("user_id", guard.session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPence = (data ?? []).reduce((sum, row) => sum + row.amount_pence, 0);
    return NextResponse.json({ totalPence });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const amountPence = Number(body?.amountPence);

    if (!amountPence || amountPence <= 0) {
        return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("finance_pot_contributions").insert({
        user_id: guard.session.user.id,
        amount_pence: Math.round(amountPence),
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
