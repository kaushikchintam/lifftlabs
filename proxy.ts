import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/require-admin";

const COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30,
};

const PROTECTED = ["/dashboard", "/mentors", "/sessions", "/messages", "/onboarding", "/admin", "/experience", "/portfolio", "/gibbs", "/resources", "/profile"];

/** Every response gets an anon_id (funnel counting) if it doesn't have one. */
function withAnon(request: NextRequest, res: NextResponse) {
  if (!request.cookies.get("anon_id")) {
    res.cookies.set("anon_id", crypto.randomUUID(), { ...COOKIE, maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({ headers: request.headers });
  const role = request.cookies.get("role")?.value;
  const next = () => withAnon(request, NextResponse.next());
  const go = (path: string) => withAnon(request, NextResponse.redirect(new URL(path, request.url)));

  // Unverified accounts can browse and finish booking (the account step
  // verifies inline); the app itself waits for the code at /verify.
  if (session && !session.user.emailVerified) {
    return PROTECTED.some((p) => pathname.startsWith(p)) || pathname === "/login" ? go("/verify") : next();
  }

  // Signed out: drop the advisory role cookie, guard the app.
  if (!session) {
    if (PROTECTED.some((p) => pathname.startsWith(p))) {
      return go(`/login?returnTo=${encodeURIComponent(pathname + request.nextUrl.search)}`);
    }
    const res = next();
    if (role) res.cookies.delete("role");
    return res;
  }

  if (pathname === "/login" || pathname === "/verify") return go("/dashboard");

  // Admin is a permission (allowlist), not a role.
  if (pathname.startsWith("/admin") && !isAdminEmail(session.user.email)) return go("/dashboard");

  // No role cookie: restore it from whichever profile exists.
  if (!role && !pathname.startsWith("/onboarding")) {
    const [{ data: mentor }, { data: learner }] = await Promise.all([
      supabaseAdmin.from("mentor_profiles").select("user_id").eq("user_id", session.user.id).maybeSingle(),
      supabaseAdmin.from("learner_profiles").select("user_id").eq("user_id", session.user.id).maybeSingle(),
    ]);

    if (mentor || learner) {
      const res = next();
      res.cookies.set("role", mentor ? "mentor" : "learner", COOKIE);
      return res;
    }

    // Approved mentors arrive by magic link and finish onboarding first.
    if (pathname.startsWith("/dashboard")) {
      const { data: magic } = await supabaseAdmin
        .from("account")
        .select("providerId")
        .eq("userId", session.user.id)
        .eq("providerId", "magic-link")
        .maybeSingle();
      if (magic) return go("/onboarding/mentor");
    }
  }

  return next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)"],
};
