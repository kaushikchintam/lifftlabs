import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("learner_profiles")
        .select("finance_set_aside_pence")
        .eq("user_id", guard.session.user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setAsidePence: data?.finance_set_aside_pence ?? 0 });
}

export async function PATCH(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const setAsidePence = Number(body?.setAsidePence);

    if (Number.isNaN(setAsidePence) || setAsidePence < 0) {
        return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from("learner_profiles")
        .update({ finance_set_aside_pence: Math.round(setAsidePence) })
        .eq("user_id", guard.session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
