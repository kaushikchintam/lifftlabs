import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

const VALID_TEST_TYPES = ["ucat", "gamsat", "mcat"] as const;

interface CreateTestScoreBody {
    test_type: string;
    sitting_date: string;
    score: string;
}

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("test_scores")
        .select("id, test_type, sitting_date, score")
        .eq("user_id", guard.session.user.id)
        .order("sitting_date", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scores: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let body: CreateTestScoreBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!VALID_TEST_TYPES.includes(body.test_type as (typeof VALID_TEST_TYPES)[number])) {
        return NextResponse.json({ error: "invalid_test_type" }, { status: 400 });
    }
    if (!body.sitting_date || !body.score?.trim()) {
        return NextResponse.json({ error: "sitting_date and score are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("test_scores")
        .insert({
            user_id: guard.session.user.id,
            test_type: body.test_type,
            sitting_date: body.sitting_date,
            score: body.score.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ score: data }, { status: 201 });
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
        .from("test_scores")
        .delete()
        .eq("id", id)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
