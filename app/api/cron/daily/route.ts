import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { render } from "@react-email/render";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend/client";
import { WaitlistLiveEmail } from "@/emails/waitlist-live";
import { JOURNEYS, answersFromLabels, answersToQuery, getJourney } from "@/features/journeys/config";

export const runtime = "nodejs";
export const maxDuration = 300;

const FROM = process.env.EMAIL_FROM ?? "LIFFT <hello@mail.lifftlabs.com>";

/**
 * Daily job (Vercel Cron, Bearer CRON_SECRET):
 *  1. complete sessions whose time has passed (never on client leave)
 *  2. email waitlisted learners whose journey now has a live mentor
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const now = Date.now();

  // 1. Auto-complete
  const { error: completeError } = await supabaseAdmin
    .from("mentor_sessions")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .lt("ends_at", new Date(now).toISOString());
  if (completeError) console.error("[cron] auto-complete failed:", completeError);

  // 2. Waitlist. A journey is live when a live mentor in it has an open slot.
  const { data: live } = await supabaseAdmin
    .from("mentor_profiles")
    .select("user_id, journeys")
    .eq("charges_enabled", true)
    .eq("paused", false);
  const { data: withSlots } = await supabaseAdmin
    .from("mentor_open_slots")
    .select("mentor_id")
    .eq("status", "open")
    .in("mentor_id", (live ?? []).map((m) => m.user_id));
  const bookable = new Set((withSlots ?? []).map((s) => s.mentor_id));
  const liveJourneys = new Set<string>();
  for (const m of live ?? []) {
    if (!bookable.has(m.user_id)) continue;
    for (const j of m.journeys as string[]) liveJourneys.add(j);
    for (const j of JOURNEYS) if (j.matchAcrossJourneys) liveJourneys.add(j.slug);
  }

  const { data: waiting } = await supabaseAdmin
    .from("waitlist")
    .select("id, email, journey, answers")
    .is("notified_at", null)
    .in("journey", [...liveJourneys]);

  let notified = 0;
  for (const w of waiting ?? []) {
    const journey = getJourney(w.journey);
    if (!journey) continue;
    const query = answersToQuery(answersFromLabels(journey, w.answers as Record<string, string[]>));
    try {
      const html = await render(
        React.createElement(WaitlistLiveEmail, {
          journeyTitle: journey.title,
          matchUrl: `${process.env.BETTER_AUTH_URL}/journey/${journey.slug}?${query}`,
        })
      );
      await resend.emails.send({ from: FROM, to: w.email, subject: "Your LIFFT mentor is ready", html });
      await supabaseAdmin.from("waitlist").update({ notified_at: new Date().toISOString() }).eq("id", w.id);
      notified++;
    } catch (err) {
      console.error(`[cron] waitlist email failed id=${w.id}:`, err);
    }
  }

  return NextResponse.json({ notified });
}
