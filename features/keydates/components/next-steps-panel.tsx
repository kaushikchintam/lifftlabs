"use client";

import { useEffect, useRef, useState } from "react";
import { ListChecks, X } from "lucide-react";
import { APP_DATES } from "./application-calendar";

interface Highlight {
  label: string;
  /** Real date — drives both sorting and the "still upcoming" filter, so
   *  this list quietly rolls forward on its own as months pass. */
  date: Date;
  /** Solid brand chip for fixed, same-for-everyone deadlines; soft chip for
   *  everything else (seasons, seat-dependent dates). */
  hard: boolean;
  description: string;
}

// Mirrors the milestones in application-calendar.tsx's APP_DATES, but as
// concrete dates rather than month-index chips — that's what lets this panel
// rank "closest to today" instead of just rendering next steps in row order.
const HIGHLIGHTS: Highlight[] = [
  { label: "Last UCAT test date", date: new Date(2026, 8, 25), hard: false, description: "Book now if you haven't — late slots go first" },
  { label: "UCAS deadline for medicine", date: new Date(2026, 9, 15), hard: true, description: "Hard deadline, every UK medical school" },
  { label: "Earliest interview invites", date: new Date(2026, 10, 1), hard: false, description: "Season opens — timing varies by school" },
  { label: "University decisions due", date: new Date(2027, 4, 15), hard: false, description: "All offers and rejections must be issued by mid-May" },
  { label: "Reply to your offers", date: new Date(2027, 5, 1), hard: true, description: "Firm and insurance choices due for offers received by 31 March" },
  { label: "A-level results day", date: new Date(2027, 7, 14), hard: true, description: "Place confirmed — or call unis fast, medicine places do appear in clearing" },
];

const MAX_SHOWN = 3;

const dateChip = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const dateChipWithDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function NextStepsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const now = new Date();
  const upcoming = HIGHLIGHTS
    .filter((h) => h.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SHOWN);

  return (
    <div ref={panelRef} className="relative inline-block">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-brand-tint px-3 py-1 font-dm-sans text-xs font-semibold text-ink-muted">
          {APP_DATES.cycle} cycle
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-[#FBF7EE] transition-colors hover:bg-brand-hover"
        >
          <ListChecks size={14} />
          Next steps
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-5 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-dm-serif text-lg text-ink">Up next for you</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-muted transition-colors hover:text-ink"
              aria-label="Close"
            >
              <X size={16} />
            </button>
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
                    className={`h-fit flex-none whitespace-nowrap rounded-full px-2.5 py-1 font-dm-sans text-[11px] font-semibold ${
                      h.hard ? "bg-brand text-[#FBF7EE]" : "bg-brand-tint text-brand"
                    }`}
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

          <p className="mt-4 border-t border-[#E8E2D6] pt-3 font-dm-sans text-xs text-ink-muted">
            Interview dates and offers are uni-specific.
          </p>
        </div>
      )}
    </div>
  );
}
