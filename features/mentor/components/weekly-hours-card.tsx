"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

export interface HoursRow {
  id: string;
  day: number;
  start: number;
  end: number;
}

const select = "rounded-xl border border-lf-line-strong bg-white px-3 py-2.5 text-[16px]";

export function WeeklyHoursCard({ rows }: { rows: HoursRow[] }) {
  const router = useRouter();
  const [day, setDay] = useState(4);
  const [start, setStart] = useState(18);
  const [end, setEnd] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(init: RequestInit, url = "/api/mentor/availability") {
    setBusy(true);
    setError(null);
    const res = await fetch(url, init);
    setBusy(false);
    if (res.status === 409) setError("That overlaps hours you already have.");
    else if (!res.ok) setError("Couldn't save. Check the times and try again.");
    else router.refresh();
  }

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-7">
      <h2 className="text-[23px] font-medium">Weekly hours</h2>
      <p className="mb-2 text-[16px] text-lf-muted">Bookable in 1-hour sessions, up to 14 days ahead. UK time.</p>
      <ul>
        {[...rows]
          .sort((a, b) => a.day - b.day || a.start - b.start)
          .map((r) => (
            <li key={r.id} className="flex items-center justify-between border-t border-lf-line py-4 text-[18px]">
              {DAYS[r.day]}s · {hh(r.start)}–{hh(r.end)}
              <button
                className="text-[15px] text-[#833BAC] hover:underline"
                disabled={busy}
                onClick={() => call({ method: "DELETE" }, `/api/mentor/availability?id=${r.id}`)}
              >
                Remove
              </button>
            </li>
          ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-lf-line pt-4">
        <select className={select} value={day} onChange={(e) => setDay(Number(e.target.value))} aria-label="Day">
          {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        <select className={select} value={start} onChange={(e) => setStart(Number(e.target.value))} aria-label="From">
          {HOURS.slice(0, 23).map((h) => <option key={h} value={h}>{hh(h)}</option>)}
        </select>
        <span className="text-lf-muted">to</span>
        <select className={select} value={end} onChange={(e) => setEnd(Number(e.target.value))} aria-label="To">
          {HOURS.slice(1).map((h) => <option key={h} value={h}>{hh(h)}</option>)}
        </select>
        <button
          className="rounded-xl bg-lf-ink px-5 py-2.5 text-[16px] font-medium text-white disabled:opacity-50"
          disabled={busy || end <= start}
          onClick={() =>
            call({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day, start, end }) })
          }
        >
          Add
        </button>
      </div>
      {error && <p className="mt-3 text-[15px] text-[#B42318]">{error}</p>}
    </div>
  );
}
