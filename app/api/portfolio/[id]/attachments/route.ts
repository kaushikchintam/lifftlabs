import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

export type FileKind = "photo" | "evidence";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PER_ENTRY = 4;
const ALLOWED: Record<FileKind, string[]> = {
    photo: ["image/jpeg", "image/png", "image/webp"],
    evidence: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const userId = guard.session.user.id;
    const { id: entryId } = await params;

    const form = await request.formData().catch(() => null);
    const kind = form?.get("kind") as FileKind;
    const file = form?.get("file");

    if (!kind || !(kind in ALLOWED)) {
        return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "file_required" }, { status: 400 });
    }
    if (!ALLOWED[kind].includes(file.type)) {
        return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "too_large" }, { status: 413 });
    }

    const { data: entry } = await supabaseAdmin
        .from("portfolio_entries")
        .select("id")
        .eq("id", entryId)
        .eq("user_id", userId)
        .maybeSingle();

    if (!entry) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Cap is per entry, not global per user — evidence is scoped to what
    // it's proving, unlike experience's per-user global photo cap.
    const { count, error: countError } = await supabaseAdmin
        .from("portfolio_attachments")
        .select("*", { count: "exact", head: true })
        .eq("portfolio_entry_id", entryId);

    if (countError) {
        return NextResponse.json({ error: "check_failed" }, { status: 500 });
    }
    if (count && count >= MAX_PER_ENTRY) {
        return NextResponse.json({ error: "attachment_cap_reached" }, { status: 400 });
    }

    const ext =
        file.type === "image/png" ? "png" :
        file.type === "image/webp" ? "webp" :
        file.type === "application/pdf" ? "pdf" : "jpg";

    const path = `${userId}/${entryId}-${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
        .from("portfolio-attachments")
        .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
        return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }

    const { data: attachment, error: insertError } = await supabaseAdmin
        .from("portfolio_attachments")
        .insert({
            portfolio_entry_id: entryId,
            user_id: userId,
            storage_path: path,
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            kind,
        })
        .select("id, file_name, kind")
        .single();

    if (insertError) {
        return NextResponse.json({ error: "persist_failed" }, { status: 500 });
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
        .from("portfolio-attachments")
        .createSignedUrl(path, 60 * 15);

    if (signError) {
        console.error(`Storage error for ${path}:`, signError.message);
    }

    return NextResponse.json(
        { ...attachment, signedUrl: signed?.signedUrl ?? "" },
        { status: 201 }
    );
}
