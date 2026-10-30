import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Avatar, Pill, btnSecondary } from "@/components/ui/lifft";
import { getJourney } from "@/features/journeys/config";
import { MENTOR_STEPS, mentorStatusLabel, mentorStep } from "@/lib/mentor-status";
import { formatPence } from "@/utils/format-date";
import { nextSession, sessionsFor } from "@/features/space/queries";
import { NextSessionCard } from "@/features/space/components/next-session-card";
import { SessionsCompact } from "@/features/space/components/sessions-list";
import { WeeklyHoursCard } from "./weekly-hours-card";
import { ManagePayoutsLink, PauseButton } from "./mentor-actions";

export async function MentorHome({ userId, name, image }: { userId: string; name: string; image?: string | null }) {
  const [{ data: profile }, { data: hours }, { count: bookable }, rows] = await Promise.all([
    supabaseAdmin
      .from("mentor_profiles")
      .select("headline, journeys, hourly_rate_pence, charges_enabled, paused, stripe_account_id")
      .eq("user_id", userId)
      .single(),
    supabaseAdmin.from("mentor_availability").select("id, day_of_week, start_time, end_time").eq("mentor_id", userId),
    supabaseAdmin
      .from("mentor_open_slots")
      .select("id", { count: "exact", head: true })
      .eq("mentor_id", userId)
      .eq("status", "open")
      .rangeGte("slot_range", `[${new Date().toISOString()},)`),
    sessionsFor(userId, "mentor"),
  ]);
  if (!profile) return null;

  const status = { hasProfile: true, hoursCount: hours?.length ?? 0, paused: profile.paused };
  const step = mentorStep(status);
  const label = mentorStatusLabel(status);
  const next = nextSession(rows);
  const now = Date.now();
  const completed = rows.filter((r) => r.status === "completed" && !r.refunded);
  const upcoming = rows.filter((r) => r.status === "confirmed" && new Date(r.scheduledAt).getTime() > now);
  const earned = completed.reduce((sum, r) => sum + (r.mentorSharePence ?? 0), 0);

  const meta = [
    profile.headline,
    (profile.journeys as string[]).map((j) => getJourney(j)?.title).filter(Boolean).join(", "),
    profile.hourly_rate_pence ? `${formatPence(profile.hourly_rate_pence)} per session` : null,
  ].filter(Boolean).join(" · ");

  const nextStep =
    step === 1
      ? { title: "Add your weekly hours", body: "Add at least one window below and you go live in matching.", action: null }
      : step === 2
        ? { title: "Bookings paused", body: "You're hidden from matching. Booked sessions still go ahead.", action: <PauseButton paused /> }
        : { title: "You're live in matching", body: `${bookable ?? 0} open times in the next 14 days.`, action: <PauseButton paused={false} /> };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <Avatar name={name} id={userId} src={image} size={80} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{name}</h1>
            <p className="text-[19px] text-lf-muted">{meta}</p>
          </div>
        </div>
        <div className="flex flex-none items-center gap-3">
          <Link href="/profile" className={btnSecondary}>Edit profile</Link>
          <Pill tone={label.toLowerCase()}>{label}</Pill>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-2">
        {MENTOR_STEPS.map((s, i) => (
          <div key={s}>
            <div className={`mb-2 h-1 rounded-full ${i <= step ? "bg-lf-ink" : "bg-[#E2E2E2]"}`} />
            <p className="text-[13px] md:text-[15px]">{s}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-lf-ink bg-white p-7 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm tracking-wide text-lf-muted">NEXT STEP</p>
          <p className="text-[23px] font-medium">{nextStep.title}</p>
          <p className="text-[17px] text-lf-muted">{nextStep.body}</p>
        </div>
        {nextStep.action}
      </div>

      {next && (
        <NextSessionCard
          session={next}
          counterpartId={next.learnerId}
          counterpartName={next.learnerName}
          detail={next.journey ? getJourney(next.journey)?.title ?? null : null}
          briefHref={`/sessions/${next.id}`}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <WeeklyHoursCard
          rows={(hours ?? []).map((h) => ({
            id: h.id,
            day: h.day_of_week,
            start: Number(String(h.start_time).slice(0, 2)),
            end: Number(String(h.end_time).slice(0, 2)),
          }))}
        />
        <div className="rounded-2xl border border-lf-line bg-white p-7">
          <h2 className="mb-5 text-[23px] font-medium">Earnings</h2>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              [String(completed.length), "Sessions"],
              [formatPence(earned), "You've earned"],
              [String(upcoming.length), "Upcoming"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl bg-lf-soft p-3 md:p-4">
                <p className="text-2xl font-semibold">{v}</p>
                <p className="text-[15px] text-lf-muted">{l}</p>
              </div>
            ))}
          </div>
          {profile.charges_enabled ? (
            <>
              <p className="mb-3 text-[15px] text-lf-muted">Paid to your Stripe account as soon as each session is booked, then to your bank on Stripe&apos;s payout schedule.</p>
              {profile.stripe_account_id && <ManagePayoutsLink />}
            </>
          ) : (
            // ponytail: swap for <SetupPayoutsButton /> once Stripe Connect is live
            <p className="text-[15px] text-lf-muted">
              <span className="font-medium text-lf-ink">Payouts are coming soon.</span> Learners can already see your profile; booking opens once payouts launch.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-lf-line bg-white p-7">
          <h2 className="mb-3 text-[23px] font-medium">Upcoming sessions</h2>
          <SessionsCompact rows={[...upcoming].reverse()} role="mentor" />
        </div>
      </div>
    </>
  );
}
