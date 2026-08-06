import React from "react";

type HardDeadline = { idx: number; chip: string };

export type CalendarRow = {
  label: string;
  cat: "Tests" | "Application" | "Interviews" | "Decisions";
  color: string;
  window?: [number, number];
  hard?: HardDeadline;
  note: string;
};

export type AppDates = {
  cycle: string;
  months: string[];
  /** `months[0]` corresponds to this year/month (JS Date months are 0-indexed — 4 = May). */
  startYear: number;
  startMonth: number;
  rows: CalendarRow[];
};

// Brand palette from app/globals.css — Tests: brand blue, Application: danger
// (hard, unmissable deadline), Interviews: warning, Decisions: success.
export const APP_DATES: AppDates = {
  cycle: "2027 entry",
  months: ["May '26", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan '27", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  startYear: 2026,
  startMonth: 4, // May
  rows: [
    { label: "UCAT registration", cat: "Tests", color: "#2596BE", window: [0, 4], note: "Registration open May–Sep 2026. Bursary applications close Sep." },
    { label: "UCAT testing window", cat: "Tests", color: "#2596BE", window: [2, 4], note: "Sit any time Jul–Sep 2026 — book early for choice of dates. Last test date late Sep." },
    { label: "UCAS application", cat: "Application", color: "#E63946", window: [4, 5], hard: { idx: 5, chip: "15 Oct" }, note: "Submit from Sep 2026. Medicine, dentistry, vet & Oxbridge deadline: 15 October 2026 — fixed across all UK unis." },
    { label: "Interview invites", cat: "Interviews", color: "#F4A261", window: [6, 10], note: "Nov 2026 – Mar 2027. Timing varies a lot by school. No invite yet ≠ rejection." },
    { label: "University decisions", cat: "Decisions", color: "#2A9D5C", window: [10, 12], hard: { idx: 12, chip: "Mid May" }, note: "Offers and rejections arrive through spring; unis must decide by mid-May 2027." },
    { label: "Respond to offers", cat: "Decisions", color: "#2A9D5C", hard: { idx: 13, chip: "Early Jun" }, note: "Reply deadline for offers received by 31 March — pick firm and insurance choices." },
    { label: "Results & confirmation", cat: "Decisions", color: "#2A9D5C", hard: { idx: 15, chip: "Mid Aug" }, note: "A-level results day 2027. Place confirmed — or phone unis fast: medicine places do appear in clearing." },
  ],
};

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
    <div className="overflow-x-auto rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-6 shadow-sm">
      <div
        className="relative grid min-w-[900px] items-center gap-y-2.5"
        style={{ gridTemplateColumns: `170px repeat(${nCols}, minmax(42px, 1fr))` }}
      >
        {/* "Now" column highlight, spanning all rows */}
        <div
          className="self-stretch rounded-lg bg-[#DDEBF3] opacity-70"
          style={{ gridColumn: `${col(todayIdx)} / ${col(todayIdx) + 1}`, gridRow: `1 / ${data.rows.length + 2}` }}
        />

        {/* Month header row */}
        <div />
        {data.months.map((m, i) => (
          <div
            key={`${m}-${i}`}
            className={`whitespace-nowrap text-center font-dm-sans text-[11px] ${
              i === todayIdx ? "font-bold text-[#2596BE]" : "font-semibold text-[#6F6B60]"
            }`}
            style={{ gridColumn: `${col(i)} / ${col(i) + 1}`, gridRow: 1 }}
          >
            {i === todayIdx ? "Now" : m}
          </div>
        ))}

        {/* One grid row per calendar row: label + optional seasonal band + optional hard chip */}
        {data.rows.map((r, ri) => {
          const row = ri + 2;
          return (
            <React.Fragment key={r.label}>
              <div
                className="pr-3.5 font-dm-sans text-[13px] font-semibold text-[#18150F]"
                style={{ gridColumn: "1 / 2", gridRow: row }}
                title={r.note}
              >
                {r.label}
              </div>
              {r.window && (
                <div
                  className="h-[26px] rounded-full opacity-[0.22]"
                  style={{ gridColumn: `${col(r.window[0])} / ${col(r.window[1]) + 1}`, gridRow: row, background: r.color }}
                />
              )}
              {r.hard && (
                <div
                  className="z-10 justify-self-center whitespace-nowrap rounded-full px-2.5 py-[5px] font-dm-sans text-[11px] font-bold text-[#FBF7EE]"
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
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-1.5 font-dm-sans text-xs text-[#6F6B60]">
          <span className="h-2.5 w-[26px] rounded-full bg-[#2596BE] opacity-[0.22]" />
          Season — happens across these weeks
        </span>
        <span className="inline-flex items-center gap-1.5 font-dm-sans text-xs text-[#6F6B60]">
          <span className="rounded-full bg-[#2596BE] px-2 py-0.5 font-dm-sans text-[10px] font-bold text-[#FBF7EE]">
            15 Oct
          </span>
          Hard deadline — same for every uni
        </span>
      </div>
    </div>
  );
}
