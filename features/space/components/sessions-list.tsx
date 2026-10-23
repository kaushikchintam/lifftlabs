import Link from "next/link";
import { Avatar, Pill, btnSecondary } from "@/components/ui/lifft";
import { formatSession } from "@/utils/format-date";
import { getJourney } from "@/features/journeys/config";
import { isJoinable } from "@/lib/join-window";
import type { Role, SessionRow } from "@/features/space/queries";

const LABEL: Record<string, string> = {
  pending: "Confirming",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function tone(s: SessionRow) {
  return s.refunded ? "refunded" : s.status;
}

/** Compact list for the Home "All sessions" / "Upcoming sessions" card. */
export function SessionsCompact({ rows, role }: { rows: SessionRow[]; role: Role }) {
  if (rows.length === 0) return <p className="text-[17px] text-lf-muted">No sessions yet.</p>;
  return (
    <ul>
      {rows.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-4 border-t border-lf-line py-4 first:border-t-0">
          <Link href={`/sessions/${s.id}`} className="hover:opacity-70">
            <p className="text-[17px] font-semibold">{formatSession(s.scheduledAt)}</p>
            <p className="text-[17px] text-lf-muted">{role === "mentor" ? s.learnerName : s.mentorName}</p>
          </Link>
          <Pill tone={tone(s)}>{s.refunded ? "Refunded" : LABEL[s.status] ?? s.status}</Pill>
        </li>
      ))}
    </ul>
  );
}

export interface RowActions {
  messageHref: string | null;
  /** learner: Book again */
  rebookHref?: string;
}

/** Full rows for the My sessions tab. */
export function SessionsFull({
  rows,
  role,
  actions,
}: {
  rows: SessionRow[];
  role: Role;
  actions: Map<string, RowActions>;
}) {
  if (rows.length === 0) {
    return <div className="rounded-2xl border border-lf-line bg-white p-8 text-[17px] text-lf-muted">No sessions yet.</div>;
  }
  return (
    <div className="space-y-4">
      {rows.map((s) => {
        const name = role === "mentor" ? s.learnerName : s.mentorName;
        const otherId = role === "mentor" ? s.learnerId : s.mentorId;
        const a = actions.get(s.id);
        return (
          <div key={s.id} className="flex flex-col gap-4 rounded-2xl border border-lf-line bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar name={name} id={otherId} size={60} />
              <div>
                <p className="text-[21px] font-semibold">{formatSession(s.scheduledAt)}</p>
                <p className="text-[17px] text-lf-muted">
                  {name}
                  {s.journey ? ` · ${getJourney(s.journey)?.title ?? s.journey}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Pill tone={tone(s)}>{s.refunded ? "Refunded" : LABEL[s.status] ?? s.status}</Pill>
              {isJoinable(s.status, s.scheduledAt, s.endsAt) && (
                <Link href={`/sessions/${s.id}/call`} className={btnSecondary}>Join</Link>
              )}
              {role === "mentor" && <Link href={`/sessions/${s.id}`} className={btnSecondary}>View brief</Link>}
              {a?.messageHref && <Link href={a.messageHref} className={btnSecondary}>Message</Link>}
              {role === "learner" && a?.rebookHref && <Link href={a.rebookHref} className={btnSecondary}>Book again</Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
