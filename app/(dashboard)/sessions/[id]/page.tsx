import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PaymentStatusRefresher } from "@/features/sessions/components/payment-status";

/**
 * Session detail (P3-11). Participants only — anyone else gets a 404, which
 * deliberately doesn't reveal whether the session exists.
 */

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-[#DDEBF3] text-[#1A7A9E]",
  completed: "bg-[#F1ECE0] text-[#18150F]",
  cancelled: "bg-[#F1ECE0] text-[#9A958A]",
  expired:   "bg-[#F1ECE0] text-[#9A958A]",
};

const STATUS_COPY: Record<string, { label: string; hint?: string }> = {
  pending: {
    label: "Awaiting payment",
    hint: "This slot is held while payment completes. It releases automatically if checkout is abandoned.",
  },
  confirmed: { label: "Confirmed" },
  completed: { label: "Completed" },
  cancelled: { label: "Cancelled" },
  expired: {
    label: "Expired",
    hint: "Payment wasn't completed in time, so the slot was released.",
  },
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;

  const { data: s } = await supabaseAdmin
    .from("mentor_sessions")
    .select(
      `id, scheduled_at, ends_at, timezone, status, notes,
       mentor_id, learner_id,
       mentor:user!mentor_sessions_mentor_id_fkey(name, email),
       learner:user!mentor_sessions_learner_id_fkey(name, email)`
    )
    .eq("id", id)
    .maybeSingle();

  // Participant check: 404 for everyone else.
  if (
    !s ||
    (s.mentor_id !== session.user.id && s.learner_id !== session.user.id)
  ) {
    notFound();
  }

  const row = s as unknown as {
    id: string;
    scheduled_at: string;
    ends_at: string;
    timezone: string;
    status: string;
    notes: string | null;
    mentor_id: string;
    learner_id: string;
    mentor: { name: string } | null;
    learner: { name: string } | null;
  };

  const tz = row.timezone || "Europe/London";
  const when = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(new Date(row.scheduled_at));
  const until = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(new Date(row.ends_at));

  const status = STATUS_COPY[row.status] ?? { label: row.status };

  // Join window: 15 min before start until session end. The button is a
  // placeholder until P5 wires Agora; the window logic is real now so the
  // page behaves correctly on day one of video.
  const nowMs = Date.now();
  const joinOpens = new Date(row.scheduled_at).getTime() - 15 * 60 * 1000;
  const joinCloses = new Date(row.ends_at).getTime();
  const joinable =
    row.status === "confirmed" && nowMs >= joinOpens && nowMs <= joinCloses;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <h1 className="font-dm-serif text-2xl text-[#18150F]">
          Session with{" "}
          {row.mentor_id === session.user.id
            ? row.learner?.name
            : row.mentor?.name}
        </h1>
        <p className="font-dm-sans text-sm text-[#6F6B60] mt-1">
          {when} – {until}
        </p>
      </header>

      <PaymentStatusRefresher status={row.status} />

      <div className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] space-y-5 p-6 shadow-sm">
        <div>
          <p className="font-dm-sans text-xs uppercase tracking-widest text-[#9A958A] mb-1.5">
            Status
          </p>
          <span className={`inline-block rounded-full px-3 py-1 font-dm-sans text-xs font-semibold ${STATUS_STYLES[row.status] ?? "bg-[#F1ECE0] text-[#9A958A]"}`}>
            {status.label}
          </span>
          {status.hint && (
            <p className="mt-2 font-dm-sans text-sm text-[#6F6B60]">{status.hint}</p>
          )}
        </div>

        <div>
          <p className="font-dm-sans text-xs uppercase tracking-widest text-[#9A958A] mb-1.5">
            Participants
          </p>
          <p className="font-dm-sans text-sm text-[#18150F]">
            {row.mentor?.name} <span className="text-[#6F6B60]">(mentor)</span> · {row.learner?.name} <span className="text-[#6F6B60]">(learner)</span>
          </p>
        </div>

        {row.notes && (
          <div>
            <p className="font-dm-sans text-xs uppercase tracking-widest text-[#9A958A] mb-1.5">
              Notes
            </p>
            <p className="font-dm-sans text-sm text-[#18150F] whitespace-pre-wrap">{row.notes}</p>
          </div>
        )}

        {row.status === "confirmed" && (
          <div className="border-t border-[#E8E2D6] pt-5">
            {joinable ? (
              <Link
                href={`/sessions/${row.id}/call`}
                className="inline-block rounded-full bg-[#18150F] px-6 py-2.5 font-dm-sans text-sm font-semibold text-[#FBF7EE] hover:bg-[#3A372F] transition-colors"
              >
                Join Session
              </Link>
            ) : (
              <button disabled className="rounded-full bg-[#18150F] px-6 py-2.5 font-dm-sans text-sm font-semibold text-[#FBF7EE] opacity-40 cursor-not-allowed">
                Join opens 15 minutes before start
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}