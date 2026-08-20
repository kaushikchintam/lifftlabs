import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const VALID_STATUSES = ["not_checked", "looks_eligible", "applied", "received"] as const;

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("funding_scheme_progress")
        .select("scheme_slug, status, actual_amount_pence")
        .eq("user_id", guard.session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data ?? [] });
}

export async function PATCH(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const schemeSlug = body?.schemeSlug as string | undefined;
    const status = body?.status as string | undefined;
    const actualAmountPence = body?.actualAmountPence;

    if (!schemeSlug || !status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json({ error: "schemeSlug and a valid status are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("funding_scheme_progress")
        .upsert(
            {
                user_id: guard.session.user.id,
                scheme_slug: schemeSlug,
                status,
                actual_amount_pence: actualAmountPence != null ? Math.round(Number(actualAmountPence)) : null,
            },
            { onConflict: "user_id,scheme_slug" }
        )
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
}
