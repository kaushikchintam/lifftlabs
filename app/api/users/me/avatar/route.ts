import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/require-admin";

/**
 * POST /api/users/me/avatar — multipart upload, stored in the public
 * "avatars" bucket, URL persisted on Better Auth's user.image.
 *
 * Requires the bucket once: Supabase Dashboard → Storage → New bucket →
 * name "avatars", Public ON. (Service role uploads bypass storage RLS,
 * consistent with ADR 010.)
 */

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  const guard = await requireSession(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = guard.session.user.id;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Stable path per user + cache-buster in the URL below
  const path = `${userId}/avatar.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("avatar upload failed:", uploadError);
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const { data: pub } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // bust stale caches on replace

  const { error: userError } = await supabaseAdmin
    .from("user")
    .update({ image: url })
    .eq("id", userId);

  if (userError) {
    return NextResponse.json({ error: "persist_failed" }, { status: 500 });
  }

  return NextResponse.json({ url });
}