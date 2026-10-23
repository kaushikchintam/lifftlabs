import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publicFormLimiter, rateLimitKey } from "@/lib/rate-limit";
import { answerLabels, getJourney, sanitizeAnswers } from "@/features/journeys/config";

const schema = z.object({
  email: z.email().max(254),
  journey: z.string(),
  answers: z.record(z.string(), z.array(z.number().int().nonnegative())),
});

/** POST /api/waitlist — public; one row per (email, journey), re-joining updates answers. */
export async function POST(request: NextRequest) {
  const { success } = await publicFormLimiter.limit(rateLimitKey(request));
  if (!success) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  const journey = parsed.success ? getJourney(parsed.data.journey) : undefined;
  if (!parsed.success || !journey) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { error } = await supabaseAdmin.from("waitlist").upsert(
    {
      email: parsed.data.email.toLowerCase(),
      journey: journey.slug,
      answers: answerLabels(journey, sanitizeAnswers(journey, parsed.data.answers)),
    },
    { onConflict: "email,journey" }
  );
  if (error) {
    console.error("[waitlist] upsert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
