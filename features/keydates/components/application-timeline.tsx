import { APP_DATES } from "../data/ucas-dates";

/**
 * Static phase-by-phase detail list — plain-language expansion of each
 * calendar row's `note`. Same source data as the Gantt chart (`APP_DATES`),
 * so the two views can't say different things about the same phase.
 */
export default function ApplicationTimeline() {
  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
      <h2 className="font-dm-serif text-2xl text-ink">Milestone Descriptions</h2>
      <div className="mt-4 border-t border-[#ECE7DD]" />

      {APP_DATES.rows.map((r, i) => (
        <div
          key={r.label}
          className={`flex items-start gap-3 py-4 ${i === 0 ? "pt-4" : "border-t border-[#ECE7DD]"}`}
        >
          <span
            className="mt-1.5 h-2 w-2 flex-none rounded-full"
            style={{ background: r.color }}
          />
          <div>
            <p className="font-dm-sans text-sm font-semibold text-ink">{r.label}</p>
            <p className="mt-0.5 font-dm-sans text-sm leading-relaxed text-ink-muted">
              {r.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
