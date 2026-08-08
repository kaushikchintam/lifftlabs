import React from "react";
import { APP_DATES, type AppDates } from "../data/ucas-dates";

/** Maps "now" onto the months array instead of trusting a hardcoded index —
 *  clamped to the visible range so a date outside the cycle can't blow up the grid. */
function currentMonthIndex(data: AppDates): number {
  const now = new Date();
  const start = data.startYear * 12 + data.startMonth;
  const current = now.getFullYear() * 12 + now.getMonth();
  return Math.min(Math.max(current - start, 0), data.months.length - 1);
}

export default function KeyDatesCalendar({ data = APP_DATES }: { data?: AppDates }) {
  const nCols = data.months.length;
  const todayIdx = currentMonthIndex(data);
  const col = (i: number) => i + 2;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
      <div
        className="relative grid min-w-[900px] items-center gap-y-3"
        style={{ gridTemplateColumns: `170px repeat(${nCols}, minmax(42px, 1fr))` }}
      >
        {/* Header row: "Activity" label + months */}
        <div className="font-dm-sans text-[11px] font-semibold uppercase tracking-wide text-ink-faintest">
          Activity
        </div>
        {data.months.map((m, i) => (
          <div
            key={`${m}-${i}`}
            className={`whitespace-nowrap text-center font-dm-sans text-[11px] ${
              i === todayIdx ? "font-bold text-brand" : "text-ink-faintest"
            }`}
            style={{ gridColumn: `${col(i)} / ${col(i) + 1}`, gridRow: 1 }}
          >
            {m}
          </div>
        ))}

        {/* One grid row per calendar row: dot + label, optional season pill, optional hard chip */}
        {data.rows.map((r, ri) => {
          const row = ri + 2;
          return (
            <React.Fragment key={r.label}>
              <div
                className="flex items-center gap-2 pr-3.5 font-dm-sans text-[13px] font-semibold text-ink"
                style={{ gridColumn: "1 / 2", gridRow: row }}
                title={r.note}
              >
                <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: r.color }} />
                {r.label}
              </div>
              {r.window && r.seasonLabel && (
                <div
                  className="flex h-7 items-center justify-center whitespace-nowrap rounded-full px-3 font-dm-sans text-[11px] font-semibold"
                  style={{
                    gridColumn: `${col(r.window[0])} / ${col(r.window[1]) + 1}`,
                    gridRow: row,
                    background: `${r.color}1F`,
                    color: r.color,
                  }}
                >
                  {r.seasonLabel}
                </div>
              )}
              {r.window && !r.seasonLabel && (
                <div
                  className="h-7 rounded-full opacity-[0.18]"
                  style={{ gridColumn: `${col(r.window[0])} / ${col(r.window[1]) + 1}`, gridRow: row, background: r.color }}
                />
              )}
              {r.hard && (
                <div
                  className="z-10 justify-self-center whitespace-nowrap rounded-full px-3 py-1.5 font-dm-sans text-[11px] font-bold text-white"
                  style={{ gridColumn: `${col(r.hard.idx)} / ${col(r.hard.idx) + 1}`, gridRow: row, background: r.color }}
                >
                  {r.hard.chip}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[#ECE7DD] pt-4">
        <span className="inline-flex items-center gap-2 font-dm-sans text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#2D6A4F]" />
          Hard deadline — same for every uni
        </span>
        <span className="inline-flex items-center gap-2 font-dm-sans text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#2D6A4F]/20" />
          Season — happens across these weeks
        </span>
      </div>
    </div>
  );
}
