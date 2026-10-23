import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { btnPrimary } from "@/components/ui/lifft";
import { JOURNEYS, getJourney } from "@/features/journeys/config";
import { findMatches } from "@/features/matching/match";
import { MentorMatchCard } from "@/features/journeys/components/mentor-match-card";
import { getServerSession } from "@/lib/auth/session";
import { isPlus } from "@/lib/auth/role";
import { supabaseAdmin } from "@/lib/supabase/admin";

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function MentorsPage(props: PageProps<"/mentors">) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const params = await props.searchParams;
  const journey = getJourney(str(params.journey) ?? "") ?? null;
  const onlyShared = params.shared === "1";
  const mentorId = str(params.mentor); // "Book again"
  const previous = str(params.previous);

  const { data: intakes } = await supabaseAdmin
    .from("intakes")
    .select("id, journey, tags")
    .eq("learner_id", session.user.id)
    .order("created_at", { ascending: false });
  const myTags = [...new Set((intakes ?? []).flatMap((i) => i.tags as string[]))];
  // Book against this journey's latest intake, else the latest one.
  const intakeId = (intakes ?? []).find((i) => i.journey === journey?.slug)?.id ?? intakes?.[0]?.id ?? null;

  const [mentors, member] = await Promise.all([
    findMatches(journey, myTags, { mentorId, all: true, onlyShared }),
    isPlus(session.user.id),
  ]);

  const href = (j: string | null, shared: boolean) => {
    const q = new URLSearchParams();
    if (j) q.set("journey", j);
    if (shared) q.set("shared", "1");
    return q.size ? `/mentors?${q}` : "/mentors";
  };

  return (
    <>
      <h1 className="mb-1 text-4xl font-bold tracking-tight md:text-5xl">Mentors</h1>
      <p className="mb-6 text-[19px] text-lf-muted">Everyone on LIFFT. Mentors who share your tags come first.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {[null, ...JOURNEYS].map((j) => {
          const on = (j?.slug ?? null) === (journey?.slug ?? null);
          return (
            <Link
              key={j?.slug ?? "all"}
              href={href(j?.slug ?? null, onlyShared)}
              className={`rounded-full border px-4 py-2 text-[15px] ${on ? "border-lf-ink bg-lf-ink text-white" : "border-lf-line bg-white text-lf-body hover:border-lf-ink"}`}
            >
              {j?.title ?? "All"}
            </Link>
          );
        })}
      </div>
      <Link
        href={href(journey?.slug ?? null, !onlyShared)}
        role="checkbox"
        aria-checked={onlyShared}
        className="mb-8 inline-flex items-center gap-2 text-[15px] text-lf-body"
      >
        <span className={`flex h-5 w-5 items-center justify-center rounded border ${onlyShared ? "border-lf-ink bg-lf-ink text-white" : "border-lf-line bg-white"}`}>
          {onlyShared && <Check size={14} />}
        </span>
        Only show mentors who share my tags
      </Link>

      {!intakeId && (
        <div className="mb-6 rounded-2xl border border-lf-line bg-white p-7">
          <p className="mb-4 text-[17px] text-lf-body">Answer a few questions so mentors know what you need before you book.</p>
          <Link href="/#journeys" className={btnPrimary}>Choose a journey</Link>
        </div>
      )}
      {mentorId && (
        <Link href={href(journey?.slug ?? null, false)} className="mb-6 block text-[15px] underline">
          Show all mentors
        </Link>
      )}

      {mentors.length === 0 ? (
        <p className="text-[17px] text-lf-muted">No mentors match these filters yet.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {mentors.map((m) => (
            <MentorMatchCard key={m.userId} mentor={m} learnerTags={myTags} intakeId={intakeId} previousSessionId={previous} member={member} />
          ))}
        </div>
      )}
    </>
  );
}
