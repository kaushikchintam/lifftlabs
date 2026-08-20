import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export async function GET(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from("resource_reflections")
        .select("resource_slug, reflection, engaged_at")
        .eq("user_id", guard.session.user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reflections: data ?? [] });
}

export async function POST(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;

    const body = await request.json().catch(() => null);
    const resourceSlug = body?.resourceSlug as string | undefined;
    const reflection = body?.reflection as string | undefined;

    if (!resourceSlug || !reflection?.trim()) {
        return NextResponse.json({ error: "resourceSlug and reflection are required" }, { status: 400 });
    }

    // No unique constraint on (user_id, resource_slug), so a Postgres
    // upsert isn't available here — check-then-branch instead.
    const { data: existing } = await supabaseAdmin
        .from("resource_reflections")
        .select("id")
        .eq("user_id", userId)
        .eq("resource_slug", resourceSlug)
        .maybeSingle();

    if (existing) {
        const { data, error } = await supabaseAdmin
            .from("resource_reflections")
            .update({ reflection: reflection.trim() })
            .eq("id", existing.id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ reflection: data });
    }

    const { data, error } = await supabaseAdmin
        .from("resource_reflections")
        .insert({
            user_id: userId,
            resource_slug: resourceSlug,
            reflection: reflection.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reflection: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
        return NextResponse.json({ error: "slug_required" }, { status: 400 });
    }

    const { data: deleted, error } = await supabaseAdmin
        .from("resource_reflections")
        .delete()
        .eq("resource_slug", slug)
        .eq("user_id", guard.session.user.id)
        .select("id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
