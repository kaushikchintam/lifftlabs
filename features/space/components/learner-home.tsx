import Link from "next/link";
import { btnPrimary } from "@/components/ui/lifft";
import { describeAnswers, getJourney } from "@/features/journeys/config";
import {
  conversationsByCounterpart,
  intakesById,
  mentorHeadlines,
  nextSession,
  sessionsFor,
} from "@/features/space/queries";
import { NextSessionCard } from "./next-session-card";
import { AboutMeCard } from "./about-me-card";
import { QuickMessageCard } from "./quick-message-card";
import { SessionsCompact } from "./sessions-list";
import { findMatches } from "@/features/matching/match";
import { MentorMatchCard } from "@/features/journeys/components/mentor-match-card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isPlus } from "@/lib/auth/role";

export async function LearnerHome({ userId, firstName, justBooked }: { userId: string; firstName: string; justBooked: boolean }) {
  const rows = await sessionsFor(userId, "learner");
  const next = nextSession(rows);
  // About me follows the next session, else the most recent booking.
  const focus = next ?? rows[0] ?? null;

  const [intakes, convos, headlines] = await Promise.all([
    intakesById([focus?.intakeId ?? null]),
    conversationsByCounterpart(userId),
    mentorHeadlines(next ? [next.mentorId] : []),
  ]);
  const intake = focus?.intakeId ? intakes.get(focus.intakeId) : undefined;
  const journey = intake ? getJourney(intake.journey) : undefined;
  const conversationId = focus ? convos.get(focus.mentorId) : undefined;

  return (
    <>
      <p className="mb-1 text-[17px] font-medium tracking-wide text-[#833BAC]">OVERVIEW</p>
      <h1 className="mb-8 text-4xl font-bold tracking-tight md:text-5xl">Welcome, {firstName}.</h1>

      {justBooked && (
        <p className="mb-6 rounded-xl bg-[#DDF3E6] px-5 py-4 text-[17px] text-[#1F7A4C]">
          Payment received. Your session confirms in a moment, and a confirmation email is on its way.
        </p>
      )}

      {rows.length === 0 ? (
        <TopMatches userId={userId} />
      ) : (
        <>
          {next && (
            <NextSessionCard
              session={next}
              counterpartId={next.mentorId}
              counterpartName={next.mentorName}
              detail={headlines.get(next.mentorId) ?? null}
            />
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            {intake && journey && focus && (
              <AboutMeCard
                intakeId={intake.id}
                mentorName={focus.mentorName}
                rows={describeAnswers(journey, intake.answers)}
                initialShared={intake.sharedKeys}
              />
            )}
            <div className="rounded-2xl border border-lf-line bg-white p-7">
              <h2 className="mb-3 text-[23px] font-medium">All sessions</h2>
              <SessionsCompact rows={rows} role="learner" />
            </div>
            {conversationId && focus && <QuickMessageCard conversationId={conversationId} name={focus.mentorName} />}
          </div>
        </>
      )}
    </>
  );
}

/** No sessions yet: their latest intake's top 3, or the waitlist note. */
async function TopMatches({ userId }: { userId: string }) {
  const { data: latest } = await supabaseAdmin
    .from("intakes")
    .select("id, journey, tags")
    .eq("learner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const journey = latest ? getJourney(latest.journey) : undefined;
  if (!latest || !journey) {
    return (
      <div className="rounded-2xl border border-lf-line bg-white p-8">
        <h2 className="mb-2 text-[23px] font-medium">Find your mentor</h2>
        <p className="mb-6 text-[17px] text-lf-muted">Answer two or three questions and we&apos;ll match you.</p>
        <Link href="/#journeys" className={btnPrimary}>Choose a journey</Link>
      </div>
    );
  }

  const tags = latest.tags as string[];
  const [matches, member] = await Promise.all([findMatches(journey, tags), isPlus(userId)]);
  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-[23px] font-medium">{matches.length ? "Your top matches" : `No ${journey.title.toLowerCase()} mentors yet`}</h2>
        <Link href={`/mentors?journey=${journey.slug}`} className="text-[15px] underline">See all mentors</Link>
      </div>
      {matches.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {matches.map((m) => <MentorMatchCard key={m.userId} mentor={m} learnerTags={tags} intakeId={latest.id} member={member} />)}
        </div>
      ) : (
        <p className="text-[17px] text-lf-muted">We&apos;ll email you the moment one is live. Meanwhile, browse everyone on the Mentors tab.</p>
      )}
    </>
  );
}
