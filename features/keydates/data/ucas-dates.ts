export type HardDeadline = { idx: number; chip: string };

export type CalendarRow = {
  label: string;
  cat: "Tests" | "Application" | "Interviews" | "Decisions";
  color: string;
  window?: [number, number];
  /** Short label rendered inside the pale season pill, e.g. "Open: May – Sep".
   *  Omitted rows (UCAS application) render a bare tinted band instead. */
  seasonLabel?: string;
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

// Single source of truth for the UCAS cycle — the Gantt calendar, the phase
// details list, and (indirectly, via its own concrete-dated mirror) the next
// steps panel all read from this so they can't drift apart.
// Brand palette from app/globals.css — Tests: brand blue, Application: danger
// (hard, unmissable deadline), Interviews + Respond to offers: warning
// (learner action needed), Decisions: success (outcome from the uni).
export const APP_DATES: AppDates = {
  cycle: "2027 entry",
  months: ["May 26", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan 27", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  startYear: 2026,
  startMonth: 4, // May
  rows: [
    { label: "UCAT registration", cat: "Tests", color: "#2596BE", window: [0, 4], seasonLabel: "Open: May – Sep", note: "Registration open May–Sep 2026. Bursary applications close Sep." },
    { label: "UCAT testing window", cat: "Tests", color: "#2596BE", window: [2, 4], seasonLabel: "Testing: Jun – Sep", note: "Sit any time Jul–Sep 2026 — book early for choice of dates. Last test date late Sep." },
    { label: "UCAS application", cat: "Application", color: "#E63946", window: [4, 5], hard: { idx: 5, chip: "Oct 15 Deadline" }, note: "Submit from Sep 2026. Medicine, dentistry, vet & Oxbridge deadline: 15 October 2026 — fixed across all UK unis." },
    { label: "Interview invites", cat: "Interviews", color: "#F4A261", window: [6, 10], seasonLabel: "Invites Sent: Nov – Mar", note: "Nov 2026 – Mar 2027. Timing varies a lot by school. No invite yet ≠ rejection." },
    { label: "University decisions", cat: "Decisions", color: "#2A9D5C", window: [10, 12], seasonLabel: "Decisions: Jan – May", hard: { idx: 12, chip: "Mid May" }, note: "Offers and rejections arrive through spring; unis must decide by mid-May 2027." },
    { label: "Respond to offers", cat: "Interviews", color: "#F4A261", window: [10, 13], seasonLabel: "Response Period: Mar – Jun", hard: { idx: 13, chip: "Early Jun" }, note: "Reply deadline for offers received by 31 March — pick firm and insurance choices." },
    { label: "Results & confirmation", cat: "Decisions", color: "#2A9D5C", hard: { idx: 15, chip: "Mid Aug Results" }, note: "A-level results day 2027. Place confirmed — or phone unis fast: medicine places do appear in clearing." },
  ],
};
