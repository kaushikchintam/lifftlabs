import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/index";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({ password: z.string().min(8).max(128) });

/**
 * POST /api/onboarding/mentor — approved mentor (arrived by magic link) sets a
 * password; their profile is created from the application they submitted.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { data: application } = await supabaseAdmin
    .from("mentor_applications")
    .select("full_name, role_title, price_pence, journeys, tags, credentials, lived_experience, kind, status")
    .eq("email", session.user.email.toLowerCase())
    .maybeSingle();
  if (!application || application.status !== "approved") {
    return NextResponse.json({ error: "not_approved" }, { status: 403 });
  }

  try {
    await auth.api.setPassword({ body: { newPassword: parsed.data.password }, headers: req.headers });
  } catch {
    // Already has a password credential — non-fatal.
  }

  // Magic-link accounts have no name yet; it renders everywhere. Through Better Auth
  // (not a direct DB write) so the 5-minute session cookie cache gets the name too.
  const nameCookies = session.user.name
    ? null
    : (await auth.api.updateUser({ body: { name: application.full_name }, headers: req.headers, returnHeaders: true })).headers;

  const { error } = await supabaseAdmin.from("mentor_profiles").upsert(
    {
      user_id: session.user.id,
      headline: application.role_title,
      bio: application.lived_experience,
      credentials: application.credentials,
      journeys: application.journeys,
      tags: application.tags,
      kind: application.kind,
      hourly_rate_pence: application.price_pence,
    },
    { onConflict: "user_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const response = NextResponse.json({ success: true });
  for (const c of nameCookies?.getSetCookie() ?? []) response.headers.append("set-cookie", c);
  response.cookies.set("role", "mentor", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
