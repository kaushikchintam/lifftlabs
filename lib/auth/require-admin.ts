import { auth } from "@/lib/auth";

/**
 * Server-derived admin authorization (ADR 011).
 *
 * Authority comes from the VERIFIED session's email checked against the
 * ADMIN_EMAILS env allowlist — never from the client-controlled `role`
 * cookie, which is a UX hint only (dashboard variant rendering).
 *
 * ADMIN_EMAILS format: comma-separated, e.g. "kaushikam12@gmail.com"
 *
 * Future upgrade path: when admin needs management (adding people without a
 * deploy, permission levels, audit trail), swap the email check below for
 * Better Auth's admin plugin (`session.user.role === "admin"`). This helper
 * is the single choke point — nothing else changes.
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

type AdminGuard = 
    | {ok : true; session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>> }
    | { ok: false; status: 401 | 403 };

export async function requireAdmin(headers: Headers): Promise<AdminGuard> {
    const session = await auth.api.getSession({ headers });

    if (!session) return { ok: false, status: 401 };

    if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
        return { ok: false, status: 403 }; 
    }

    return { ok: true, session }
}

/** Plain authenticated-user guard for non-admin protected routes
 *  (e.g. /api/users/me). Same pattern, no allowlist check. */

 export async function requireSession(headers: Headers) {
    const session = await auth.api.getSession({ headers });
    if (!session) return { ok: false as const, status: 401 as const };
    return { ok: true as const, session };
 }