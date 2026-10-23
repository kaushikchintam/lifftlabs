import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Avatar, Pill, btnPrimary } from "@/components/ui/lifft";
import { describeAnswers, getJourney } from "@/features/journeys/config";
import { formatSession } from "@/utils/format-date";
import { isJoinable } from "@/lib/join-window";

/**
 * Session detail + the brief. Participants only (404 otherwise). The mentor
 * sees ONLY the answers the learner left shared; the learner sees all theirs.
 */
export default async function SessionDetailPage(props: PageProps<"/sessions/[id]">) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const { id } = await props.params;

  const { data: s } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, ends_at, status, journey, intake_id, mentor_id, learner_id, refunded_at,
       mentor:user!mentor_sessions_mentor_id_fkey(name),
       learner:user!mentor_sessions_learner_id_fkey(name)`
    )
    .eq("id", id)
    .maybeSingle();
  if (!s || (s.mentor_id !== session.user.id && s.learner_id !== session.user.id)) notFound();

  const isMentor = s.mentor_id === session.user.id;
  const other = ((isMentor ? s.learner : s.mentor) as unknown as { name: string } | null)?.name || "—";
  const otherId = isMentor ? s.learner_id : s.mentor_id;
  const journey = s.journey ? getJourney(s.journey) : undefined;

  const { data: intake } = s.intake_id
    ? await supabaseAdmin.from("intakes").select("answers, shared_keys").eq("id", s.intake_id).maybeSingle()
    : { data: null };
  const shared = new Set((intake?.shared_keys as string[] | undefined) ?? []);
  const brief = journey && intake
    ? describeAnswers(journey, intake.answers as Record<string, string[]>).filter((r) => !isMentor || shared.has(r.id))
    : [];

  return (
    <div className="max-w-[900px]">
      <div className="mb-8 flex items-center gap-5">
        <Avatar name={other} id={otherId} size={72} />
        <div>
          <h1 className="text-3xl font-medium">{formatSession(s.scheduled_at)}</h1>
          <p className="text-[19px] text-lf-muted">
            with {other}
            {journey ? ` · ${journey.title}` : ""}
          </p>
        </div>
        <div className="ml-auto">
          <Pill tone={s.refunded_at ? "refunded" : s.status}>{s.refunded_at ? "Refunded" : s.status[0].toUpperCase() + s.status.slice(1)}</Pill>
        </div>
      </div>

      {s.status === "confirmed" && (
        <div className="mb-6">
          {isJoinable(s.status, s.scheduled_at, s.ends_at) ? (
            <Link href={`/sessions/${s.id}/call`} className={btnPrimary}>Join session</Link>
          ) : (
            <span className={btnPrimary} aria-disabled>Join · opens 10 min before</span>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-lf-line bg-white p-7">
        <h2 className="text-[23px] font-medium">{isMentor ? `${other}'s brief` : "What you shared"}</h2>
        <p className="mb-2 text-[17px] text-lf-muted">
          {isMentor ? "Only what they chose to share." : "Change what's shared from About me on Home."}
        </p>
        {brief.length === 0 ? (
          <p className="border-t border-lf-line pt-4 text-[17px] text-lf-muted">Nothing shared.</p>
        ) : (
          <ul>
            {brief.map((r) => (
              <li key={r.id} className="flex items-center justify-between border-t border-lf-line py-4">
                <div>
                  <p className="text-[15px] text-lf-muted">{r.question}</p>
                  <p className="text-[19px]">{r.answer}</p>
                </div>
                {!isMentor && <Pill tone={shared.has(r.id) ? "shared" : "hidden"}>{shared.has(r.id) ? "Shared" : "Hidden"}</Pill>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
