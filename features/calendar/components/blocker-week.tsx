"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Read-only week view of the mentor's Google busy times (next 7 days),
 * grouped by day. Deliberately a list, not a grid — function over polish
 * for the soft launch; the drag-to-publish week grid is a later reward.
 *
 * Refresh strategy: poll every 30s while the tab is visible, plus an
 * immediate fetch on tab refocus — "edit in Google, switch back to LIFFT"
 * is the exact gesture a mentor makes to check it worked.
 */

interface Blocker {
  id: string;
  range: string;
  isLifftSession: boolean;
}

const POLL_MS = 30_000;

function parseRange(range: string): { start: Date; end: Date } | null {
  const m = range.match(/[\[\(]"?([^,"]+)"?\s*,\s*"?([^\)\]"]+)"?[\)\]]/);
  if (!m) return null;
  return { start: new Date(m[1]), end: new Date(m[2]) };
}

export function BlockerWeek() {
  const [blockers, setBlockers] = useState<Blocker[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/mentor/blockers");
        if (!cancelled && res.ok) {
          setBlockers((await res.json()).blockers);
        } else if (!cancelled && blockers === null) {
          setBlockers([]); // first load failed — show empty state, not spinner forever
        }
      } catch {
        if (!cancelled && blockers === null) setBlockers([]);
      }
    };

    load(); // initial

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load(); // skip hidden tabs
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byDay = useMemo(() => {
    const groups = new Map<string, Array<Blocker & { start: Date; end: Date }>>();
    for (const b of blockers ?? []) {
      const parsed = parseRange(b.range);
      if (!parsed) continue;
      const key = new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(parsed.start);
      const list = groups.get(key) ?? [];
      list.push({ ...b, ...parsed });
      groups.set(key, list);
    }
    return groups;
  }, [blockers]);

  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (blockers === null) {
    return <p className="text-sm text-muted-foreground">Loading busy times…</p>;
  }

  if (blockers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nothing on your Google Calendar for the next 7 days — or the first
        sync hasn't run yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 font-dm-sans">
      {[...byDay.entries()].map(([day, items]) => (
        <div key={day}>
          <p className="text-[14.5px] font-semibold text-[#18150F]">{day}</p>
          <ul className="mt-1 space-y-0.5">
            {items.map((b) => (
              <li key={b.id} className="flex items-center gap-2.5 py-0.5 pl-0.5">
                <span
                  className={`h-2 w-2 flex-none rounded-full ${
                    b.isLifftSession ? "bg-[#2596BE]" : "bg-[#9A958A]"
                  }`}
                />
                <span className="text-[14.5px] font-semibold text-[#18150F]">
                  {timeFmt.format(b.start)}–{timeFmt.format(b.end)}
                </span>
                <span className="text-sm text-[#6F6B60]">
                  {b.isLifftSession ? "LIFFT session" : "busy"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}