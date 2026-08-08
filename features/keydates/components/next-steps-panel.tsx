interface Highlight {
  label: string;
  /** Real date — drives both sorting and the "still upcoming" filter, so
   *  this list quietly rolls forward on its own as months pass. */
  date: Date;
  /** Solid chip for fixed, same-for-everyone deadlines; pale tinted chip for
   *  everything else (seasons, seat-dependent dates). */
  hard: boolean;
  /** Matches the corresponding calendar row's category color, so this panel
   *  reads as the same system as the Gantt chart and milestone list. */
  color: string;
  description: string;
}

// Mirrors the milestones in data/ucas-dates.ts's APP_DATES, but as concrete
// dates rather than month-index chips — that's what lets this panel rank
// "closest to today" instead of just rendering next steps in row order.
const HIGHLIGHTS: Highlight[] = [
  { label: "Last UCAT test date", date: new Date(2026, 8, 25), hard: false, color: "#2596BE", description: "Book now if you haven't — late slots go first" },
  { label: "UCAS deadline for medicine", date: new Date(2026, 9, 15), hard: true, color: "#E63946", description: "Hard deadline, every UK medical school" },
  { label: "Earliest interview invites", date: new Date(2026, 10, 1), hard: false, color: "#F4A261", description: "Season opens — timing varies by school" },
  { label: "University decisions due", date: new Date(2027, 4, 15), hard: false, color: "#2A9D5C", description: "All offers and rejections must be issued by mid-May" },
  { label: "Reply to your offers", date: new Date(2027, 5, 1), hard: true, color: "#F4A261", description: "Firm and insurance choices due for offers received by 31 March" },
  { label: "A-level results day", date: new Date(2027, 7, 14), hard: true, color: "#2A9D5C", description: "Place confirmed — or call unis fast, medicine places do appear in clearing" },
];

const MAX_SHOWN = 3;

const dateChip = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const dateChipWithDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Always-visible card — no trigger button, no open/close state. Pure
 *  function of "now", so this stays a server component. */
export function NextStepsPanel() {
  const now = new Date();
  const upcoming = HIGHLIGHTS
    .filter((h) => h.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SHOWN);

  const actionRequired = upcoming[0]?.hard ?? false;

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-dm-serif text-lg text-ink">Up next for you</h3>
        {actionRequired && (
          <span className="rounded-full bg-[#E63946]/10 px-2.5 py-1 font-dm-sans text-[10px] font-bold uppercase tracking-wide text-[#E63946]">
            Action Required
          </span>
        )}
      </div>

      {upcoming.length === 0 ? (
        <p className="font-dm-sans text-sm text-ink-muted">
          Nothing left on the calendar for this cycle.
        </p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((h) => (
            <li key={h.label} className="flex gap-3">
              <span
                className="h-fit flex-none whitespace-nowrap rounded-full px-2.5 py-1 font-dm-sans text-[11px] font-semibold"
                style={
                  h.hard
                    ? { background: h.color, color: "#FFFFFF" }
                    : { background: `${h.color}1F`, color: h.color }
                }
              >
                {h.hard ? dateChipWithDay.format(h.date) : dateChip.format(h.date)}
              </span>
              <div>
                <p className="font-dm-sans text-sm font-semibold text-ink">{h.label}</p>
                <p className="font-dm-sans text-xs leading-relaxed text-ink-muted">
                  {h.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-1.5 border-t border-[#ECE7DD] pt-3 font-dm-sans text-xs text-ink-muted">
        Interview dates and offers are uni-specific.
      </p>
    </div>
  );
}
