import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { KINDS } from "@/features/journeys/config";

const schema = z.object({
  applicationId: z.uuid(),
  kind: z.string().refine((k) => Object.hasOwn(KINDS, k)), // `in` would accept "toString"
});

const REQUIRED_CHECKS = ["identity", "registration", "insurance", "references"];

/** POST /api/mentors/approve — all four checks done → approve + magic link to onboarding. */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request.headers);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.status === 401 ? "Unauthorized" : "Forbidden" }, { status: guard.status });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { data: app } = await supabaseAdmin
    .from("mentor_applications")
    .select("id, full_name, email, checks, status")
    .eq("id", parsed.data.applicationId)
    .maybeSingle();
  if (!app) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const checks = (app.checks ?? {}) as Record<string, unknown>;
  if (!REQUIRED_CHECKS.every((k) => checks[k])) {
    return NextResponse.json({ error: "checks_incomplete" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("mentor_applications")
    .update({
      status: "approved",
      kind: parsed.data.kind,
      reviewed_at: new Date().toISOString(),
      reviewed_by: guard.session.user.id,
    })
    .eq("id", app.id);
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });

  await auth.api.signInMagicLink({
    body: {
      email: app.email,
      // New accounts are created with this name, so the session cookie has it from the first page.
      name: app.full_name,
      callbackURL: "/onboarding/mentor",
      // Payouts are set up from the dashboard stepper after onboarding.
      metadata: { fullName: app.full_name, stripeLink: `${process.env.BETTER_AUTH_URL}/dashboard`, isAdminApproval: true },
    },
    headers: request.headers,
  });

  return NextResponse.json({ success: true });
}
