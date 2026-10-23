import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { bookingLimiter, rateLimitKey } from "@/lib/rate-limit";
import { answerLabels, getJourney, isComplete, sanitizeAnswers, tagsFor } from "@/features/journeys/config";
import { findMatches } from "@/features/matching/match";
import { logFunnel } from "@/lib/funnel";

const schema = z.object({
  journey: z.string(),
  answers: z.record(z.string(), z.array(z.number().int().nonnegative())),
});

/** POST /api/intakes — save a verified learner's answers. Their first intake = they just signed up. */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!session.user.emailVerified) return NextResponse.json({ error: "email_unverified" }, { status: 403 });

  const { success } = await bookingLimiter.limit(rateLimitKey(request, session.user.id));
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  const journey = parsed.success ? getJourney(parsed.data.journey) : undefined;
  if (!parsed.success || !journey) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const answers = sanitizeAnswers(journey, parsed.data.answers);
  if (!isComplete(journey, answers)) return NextResponse.json({ error: "intake_incomplete" }, { status: 400 });

  const learnerId = session.user.id;
  const tags = tagsFor(journey, answers);
  const labels = answerLabels(journey, answers);

  // Insert, not upsert: 23505 = profile already existed, so this is a returning learner.
  const { error: profileError } = await supabaseAdmin.from("learner_profiles").insert({ user_id: learnerId });
  if (profileError && profileError.code !== "23505") {
    console.error("learner profile insert failed:", profileError);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  const { data: intake, error } = await supabaseAdmin
    .from("intakes")
    .insert({
      learner_id: learnerId,
      journey: journey.slug,
      answers: labels,
      tags,
      shared_keys: journey.questions.map((q) => q.id), // shared by default; learner can hide any
    })
    .select("id")
    .single();
  if (error) {
    console.error("intake insert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  await logFunnel(profileError ? "intake" : "signed_up", journey.slug, learnerId);

  // Nobody live for this journey yet: the daily cron emails them when someone is.
  const waitlisted = (await findMatches(journey, tags)).length === 0;
  if (waitlisted) {
    await supabaseAdmin
      .from("waitlist")
      .upsert({ email: session.user.email.toLowerCase(), journey: journey.slug, answers: labels }, { onConflict: "email,journey" });
  }

  return NextResponse.json({ intakeId: intake.id, waitlisted });
}
