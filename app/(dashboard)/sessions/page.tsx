import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Sessions list (P3-10). One page for both roles: shows every session where
 * the current user is mentor or learner, split into upcoming and past.
 */

interface SessionRow {
  id: string;
  scheduled_at: string;
  ends_at: string;
  timezone: string;
  status: string;
  mentor_id: string;
  learner_id: string;
  mentor: { name: string } | null;
  learner: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-[#DDEBF3] text-[#1A7A9E]",
  completed: "bg-[#F1ECE0] text-[#18150F]",
  cancelled: "bg-[#F1ECE0] text-[#9A958A]",
  expired:   "bg-[#F1ECE0] text-[#9A958A]",
};

function formatWhen(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz || "Europe/London",
  }).format(new Date(iso));
}

function SessionCard({ s, userId }: { s: SessionRow; userId: string }) {
  const isMentor = s.mentor_id === userId;
  const counterpart = isMentor ? s.learner?.name : s.mentor?.name;
  return (
    <Link href={`/sessions/${s.id}`}>
      <div className="flex items-center justify-between rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] px-5 py-4 shadow-sm transition-colors hover:bg-[#F1ECE0]">
        <div>
          <p className="font-dm-sans font-semibold text-[#18150F]">
            {isMentor ? "Session with " : "Mentoring session with "}
            {counterpart ?? "—"}
          </p>
          <p className="font-dm-sans text-sm text-[#6F6B60] mt-0.5">
            {formatWhen(s.scheduled_at, s.timezone)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 font-dm-sans text-xs font-semibold ${STATUS_STYLES[s.status] ?? "bg-[#F1ECE0] text-[#9A958A]"}`}>
          {STATUS_LABELS[s.status] ?? s.status}
        </span>
      </div>
    </Link>
  );
}

export default async function SessionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  const { data } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, ends_at, timezone, status, mentor_id, learner_id,
       mentor:user!mentor_sessions_mentor_id_fkey(name),
       learner:user!mentor_sessions_learner_id_fkey(name)`
    )
    .or(`mentor_id.eq.${userId},learner_id.eq.${userId}`)
    .in("status", ["pending", "confirmed", "completed", "cancelled"])
    .order("scheduled_at", { ascending: false });

  const sessions = (data ?? []) as unknown as SessionRow[];
  const now = new Date();
  const upcoming = sessions
    .filter((s) => new Date(s.ends_at) >= now && s.status !== "cancelled")
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const past = sessions.filter(
    (s) => new Date(s.ends_at) < now || s.status === "cancelled"
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="font-archivo-black text-2xl text-[#18150F] tracking-widest uppercase">Sessions</h1>

      <section className="space-y-3">
        <h2 className="font-dm-serif text-xl text-[#18150F]">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="font-dm-sans text-sm text-[#6F6B60]">
            Nothing booked yet. Browse mentors to schedule a session.
          </p>
        ) : (
          upcoming.map((s) => <SessionCard key={s.id} s={s} userId={userId} />)
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-dm-serif text-xl text-[#18150F]">Past</h2>
        {past.length === 0 ? (
          <p className="font-dm-sans text-sm text-[#6F6B60]">No past sessions.</p>
        ) : (
          past.map((s) => <SessionCard key={s.id} s={s} userId={userId} />)
        )}
      </section>
    </div>
  );
}