import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/index";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { specialty, one_liner, available_days, hourly_rate, password } = await req.json();

  // "£80/hr" → 8000 pence
  const hourly_rate_pence = parseInt(hourly_rate.replace(/[^0-9]/g, ""), 10) * 100;

  try {
    await auth.api.setPassword({
      body: { newPassword: password },
      headers: req.headers,
    });
  } catch {
    //magic-link accounts may not have a password credentials yet, non-fatal.
  }

  // Magic-link accounts were created from an email alone — Better Auth's
  // user row has no name, which blanks the mentor everywhere it renders
  // (browse cards, chat, sessions). Persist it from their application.
  const { data: application } = await supabaseAdmin
    .from("mentor_applications")
    .select("full_name")
    .eq("email", session.user.email)
    .maybeSingle();

  if (application?.full_name && !session.user.name) {
    await supabaseAdmin
      .from("user")
      .update({ name: application.full_name })
      .eq("id", session.user.id);
  }

  const { error } = await supabaseAdmin.from("mentor_profiles").insert({
    user_id: session.user.id,
    specialty: [specialty],
    one_liner,
    available_days,
    hourly_rate_pence,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const response = NextResponse.json({ success: true });

  response.cookies.set("role", "mentor", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}