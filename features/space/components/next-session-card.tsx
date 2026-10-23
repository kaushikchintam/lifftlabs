import Link from "next/link";
import { Avatar } from "@/components/ui/lifft";
import { formatSession } from "@/utils/format-date";
import { isJoinable } from "@/lib/join-window";
import type { SessionRow } from "@/features/space/queries";

/** The dark "Next session" banner — learner and mentor both. */
export function NextSessionCard({
  session,
  counterpartId,
  counterpartName,
  detail,
  briefHref,
}: {
  session: SessionRow;
  counterpartId: string;
  counterpartName: string;
  /** "Personal trainer · shift workers" / journey title */
  detail: string | null;
  /** Mentor only. */
  briefHref?: string;
}) {
  const joinable = isJoinable(session.status, session.scheduledAt, session.endsAt);

  return (
    <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-lf-ink p-8 text-white md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-5">
        <Avatar name={counterpartName} id={counterpartId} size={80} />
        <div>
          <p className="text-[17px] text-white/70">Next session</p>
          <p className="text-3xl font-medium">{formatSession(session.scheduledAt)}</p>
          <p className="text-[19px] text-white/80">
            with {counterpartName}
            {detail ? ` · ${detail}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {joinable ? (
          <Link href={`/sessions/${session.id}/call`} className="rounded-xl bg-white px-6 py-4 text-[19px] font-medium text-lf-ink">
            Join session
          </Link>
        ) : (
          <span className="rounded-xl bg-white px-6 py-4 text-[19px] font-medium text-lf-ink" aria-disabled>
            Join · opens 10 min before
          </span>
        )}
        {briefHref && (
          <Link href={briefHref} className="rounded-xl border border-white/30 px-6 py-4 text-[19px] font-medium">
            View brief
          </Link>
        )}
      </div>
    </div>
  );
}
