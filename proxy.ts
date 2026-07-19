import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });
  const role = request.cookies.get("role")?.value;

  //to check if user is an unverifed state or not
  if (session && !session.user.emailVerified) {
    if (!pathname.startsWith("/signup") && !pathname.startsWith("/api/auth")) {
      return NextResponse.redirect(new URL("/signup/learner", request.url));
    }
    return NextResponse.next();
  }

    //clear state role cookie if session is gone
  if(!session && role) {
    const res = NextResponse.next();
    res.cookies.delete("role");
    return res
  }

  if (session && process.env.ADMIN_EMAILS?. split(",").includes(session.user.email ?? "")) {
    if (role !== "admin") {
      const res = NextResponse.next();
      res.cookies.set("role", "admin", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return res;
    }
  }
  // 1. No session + protected path → login
  if (!session && (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/admin")
  )) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Session + auth page → dashboard
  if (session && (pathname === "/login" || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Session + no role cookie
  if (session && !role) {
    if (pathname.startsWith("/onboarding")) return NextResponse.next();

    // Check if user already completed onboarding — auto-restore role cookie
    const [{ data: mentorProfile }, { data: learnerProfile }] = await Promise.all([
      supabaseAdmin.from("mentor_profiles").select("user_id").eq("user_id", session.user.id).maybeSingle(),
      supabaseAdmin.from("learner_profiles").select("user_id").eq("user_id", session.user.id).maybeSingle(),
    ]);

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    };

    if (mentorProfile) {
      const res = NextResponse.redirect(new URL("/dashboard", request.url));
      res.cookies.set("role", "mentor", cookieOpts);
      return res;
    }

    if (learnerProfile) {
      const res = NextResponse.redirect(new URL("/dashboard", request.url));
      res.cookies.set("role", "learner", cookieOpts);
      return res;
    }

    // No profile yet → send to correct onboarding
    if (pathname.startsWith("/dashboard")) {
      const { data: mentorAccount } = await supabaseAdmin
        .from("account")
        .select("providerId")
        .eq("userId", session.user.id)
        .eq("providerId", "magic-link")
        .maybeSingle();

      return NextResponse.redirect(new URL(
        mentorAccount ? "/onboarding/mentor" : "/onboarding/learner",
        request.url
      ));
    }
  }

  // 4. Non-admin trying to reach /admin
  if (session && pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
};
