import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const [{ data, error }, { data: profile, error: profileError }] = await Promise.all([
        supabaseAdmin
            .from("finance_pot_contributions")
            .select("amount_pence")
            .eq("user_id", guard.session.user.id),
        supabaseAdmin
            .from("learner_profiles")
            .select("finance_pot_goal_pence")
            .eq("user_id", guard.session.user.id)
            .maybeSingle(),
    ]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const totalPence = (data ?? []).reduce((sum, row) => sum + row.amount_pence, 0);
    return NextResponse.json({ totalPence, goalPence: profile?.finance_pot_goal_pence ?? null });
}

export async function PATCH(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const goalPence = Number(body?.goalPence);

    if (!goalPence || goalPence <= 0) {
        return NextResponse.json({ error: "invalid_goal" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("learner_profiles")
        .update({ finance_pot_goal_pence: Math.round(goalPence) })
        .eq("user_id", guard.session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const amountPence = Number(body?.amountPence);

    // Negative amounts are allowed — editing the displayed total directly
    // (see PotCard) records the difference as a contribution, which can be
    // a correction downward. Zero/NaN is still meaningless, so rejected.
    if (!amountPence || Number.isNaN(amountPence)) {
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
