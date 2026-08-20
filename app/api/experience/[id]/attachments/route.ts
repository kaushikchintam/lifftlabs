//POST (upload to Storage + insert metadata row, enforces the 4-photo cap)
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin"; 

export type FileKind = 'photo' | 'evidence';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PER_KIND = 4;
const ALLOWED: Record<FileKind, string[]> = {
    photo: ["image/jpeg", "image/png", "image/webp"],
    evidence: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};

export async function POST (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const guard = await requireSession(request.headers);
    if (!guard.ok) {
        return NextResponse.json({ error: "unauthorized"}, { status: 401 });
    }
    const userId = guard.session.user.id;
    const { id: experienceId } = await params;

    const form = await request.formData().catch(() => null);
    const kind = form?.get("kind") as FileKind;
    const file = form?.get("file");
    
    //validating the kind parametetr exists
    if (!kind || !(kind in ALLOWED)) {
        return NextResponse.json({ error: "invalid_kind"}, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "file_required" }, { status: 400 });
    }

    const allowedTypes = ALLOWED[kind];

    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
    }

    if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "too_large" }, { status: 413 });
    }

    // Ownership check on the parent log entry before accepting a file for it. 
    const { data: log } = await supabaseAdmin
      .from("experience_log")
      .select("id")
      .eq("id", experienceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!log) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }


    //Enforce a 4-file cap per kind (photo and evidence tracked separately,
    //same global-per-user scope the original photo check used.)
    const { count, error: countError } = await supabaseAdmin
      .from("experience_attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", kind);
      
    if (countError) {
        return NextResponse.json({ error: "check_failed "}, { status: 500 });
    }
    if (count && count >=MAX_PER_KIND) {
            return NextResponse.json({ error: `${kind}_cap_reached`}, { status: 400 });
        }

    const ext = 
    file.type === "image/png" ? "png" : 
    file.type === "image/webp" ? "webp" :
    file.type === "application/pdf" ? "pdf" : "jpg";

    //Generate unique storage paths to avoid collisions
    const uniqueId = crypto.randomUUID();
    const path = `${userId}/${kind}-${uniqueId}.${ext}`;

    const buffer = Buffer.from (await file.arrayBuffer());
    const { error: uploadError } = await supabaseAdmin.storage
      .from("experience-attachments")
      .upload(path, buffer, { contentType: file.type, upsert: true});
    
    if (uploadError) {
        return NextResponse.json ({ error: "upload_failed" }, { status: 500 });
    }

    const { data: attachment, error: insertError } = await supabaseAdmin
    .from("experience_attachments")
    .insert({
        experience_id: experienceId,
        user_id: userId, 
        storage_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size, 
        kind: kind,
    })
    .select("id, file_name, kind")
    .single();
    
    if (insertError) {
        return NextResponse.json({ error: "persist_failed" }, { status: 500 });
    }

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("experience-attachments")
      .createSignedUrl(path, 60 * 15);

    if (signError) {
        console.error(`Storage error for ${path}:`, signError.message);
    }
    
    return NextResponse.json(
        { ...attachment, signedUrl: signed?.signedUrl ?? "" },
    { status: 201 }
    );
}