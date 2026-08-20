import Link from "next/link";
import { HIGHLIGHTS } from "@/features/keydates/components/next-steps-panel";

/**
 * Right-column card — the nearest hard UCAS deadline, reusing the same
 * dated highlights list NextStepsPanel already derives from. No fetch, no
 * route of its own; just a different slice of the same source of truth.
 */
export function TimelineViewCard() {
  const now = new Date();
  const nearestHard = HIGHLIGHTS.filter((h) => h.hard && h.date >= now).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )[0];

  return (
    <div className="h-fit rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-dm-serif text-xl text-ink">Timeline view</h3>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 font-dm-sans text-[10px] font-bold uppercase tracking-wide text-brand">
          Live Map
        </span>
      </div>

      <p className="font-dm-sans text-sm leading-relaxed text-ink-muted">
        Your checklist items are automatically plotted to the general UK
        Medicine Admissions calendar for stress-free deadline tracking.
      </p>

      {nearestHard && (
        <div className="mt-4 rounded-xl border border-[#ECE7DD] bg-[#FAF8F3] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-ink">
              {nearestHard.label}
            </p>
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-danger" />
          </div>
          <p className="mt-1 font-dm-sans text-sm text-ink-muted">{nearestHard.description}</p>
        </div>
      )}

      <Link
        href="/keydates"
        className="mt-4 block text-center font-dm-sans text-sm font-semibold text-brand hover:underline"
      >
        Open Key Dates Calendar →
      </Link>
    </div>
  );
}
