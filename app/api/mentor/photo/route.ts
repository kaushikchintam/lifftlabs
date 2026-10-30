import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** POST /api/mentor/photo — upload a profile photo to the public "avatars" bucket and set user.image.
 *  ponytail: old photos are left in the bucket; sweep them if storage ever matters. */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from("avatars")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (error) return NextResponse.json({ error: "upload_failed" }, { status: 500 });

  const image = supabaseAdmin.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  // Through Better Auth so the session cookie picks up the new image too.
  const { headers } = await auth.api.updateUser({ body: { image }, headers: request.headers, returnHeaders: true });
  const res = NextResponse.json({ image });
  for (const c of headers.getSetCookie()) res.headers.append("set-cookie", c);
  return res;
}
