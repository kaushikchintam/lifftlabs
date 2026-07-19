"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Mentor slot publishing (P3-07). Drop into the mentor calendar page below
 * the connected-calendar / blockers view:
 *
 *   <SlotPublisher />
 *
 * Talks to /api/mentor/slots (GET, POST) and /api/mentor/slots/[id] (DELETE).
 * Sessions are fixed at 60 minutes; slots can start any time in the future
 * (no minimum-notice rule — product decision).
 */

interface Slot {
  id: string;
  slot_range: string; // tstzrange literal from Postgres
  status: "open" | "held" | "booked" | "withdrawn";
}

const SESSION_MINUTES = 60;

const STATUS_STYLES: Record<Slot["status"], string> = {
  open: "bg-[#DDEBF3] text-[#1A7A9E]",
  held: "bg-[#FEF3C7] text-[#92400E]",
  booked: "bg-[#F1ECE0] text-[#18150F]",
  withdrawn: "bg-[#F1ECE0] text-[#9A958A] line-through",
};

function parseRange(range: string): { start: Date; end: Date } | null {
  const m = range.match(/[\[\(]"?([^,"]+)"?\s*,\s*"?([^\)\]"]+)"?[\)\]]/);
  if (!m) return null;
  return { start: new Date(m[1]), end: new Date(m[2]) };
}

function formatSlot(range: string): string {
  const parsed = parseRange(range);
  if (!parsed) return range;
  const day = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parsed.start);
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}, ${time.format(parsed.start)}–${time.format(parsed.end)}`;
}

const ERROR_MESSAGES: Record<string, string> = {
  in_the_past: "That start time has already passed.",
  conflicts_with_calendar: "That time clashes with an event in your Google Calendar.",
  overlaps_existing_slot: "You already have a slot covering that time.",
  invalid_body: "Check the date and start time.",
};

export function SlotPublisher() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const loadSlots = useCallback(async () => {
    const res = await fetch("/api/mentor/slots");
    if (res.ok) {
      const { slots } = await res.json();
      setSlots(slots);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function publish() {
    setError(null);
    if (!date || !time) {
      setError("Pick a date and start time.");
      return;
    }
    setPublishing(true);
    // Local wall-clock → ISO with the browser's offset
    const startsAt = new Date(`${date}T${time}`).toISOString();

    const res = await fetch("/api/mentor/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startsAt, durationMinutes: SESSION_MINUTES }),
    });

    if (res.ok) {
      setDate("");
      setTime("");
      await loadSlots();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(ERROR_MESSAGES[body.error] ?? "Couldn't publish that slot. Try again.");
    }
    setPublishing(false);
  }

  async function withdraw(id: string) {
    const res = await fetch(`/api/mentor/slots/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadSlots();
    } else {
      setError("That slot can't be withdrawn — it may already be held or booked.");
    }
  }

  const upcoming = slots.filter((s) => {
    const parsed = parseRange(s.slot_range);
    return parsed && parsed.end > new Date();
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-6 shadow-sm">
        <h2 className="font-dm-serif text-2xl text-[#18150F] mb-1">Publish a session slot</h2>
        <p className="font-dm-sans text-sm text-[#6F6B60] mb-5">
          Sessions are 60 minutes. Learners can book any open slot — times
          that clash with your Google Calendar are rejected automatically.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 font-dm-sans text-sm font-semibold text-[#18150F]">
            Date
            <Input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl bg-[#F1ECE0] border-[#E8E2D6] px-4 py-3 font-dm-sans text-[15px] font-semibold"
            />
          </label>
          <label className="grid gap-1 font-dm-sans text-sm font-semibold text-[#18150F]">
            Start time
            <Input
              type="time"
              step={900}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl bg-[#F1ECE0] border-[#E8E2D6] px-4 py-3 font-dm-sans text-[15px] font-semibold"
            />
          </label>
          <button
            onClick={publish}
            disabled={publishing}
            className="rounded-full bg-[#18150F] text-[#FBF7EE] font-dm-sans font-semibold px-5 py-2.5 hover:bg-[#3A372F] disabled:opacity-40 transition-colors"
          >
            {publishing ? "Publishing…" : "Publish slot"}
          </button>
        </div>

        {error && <p className="mt-3 font-dm-sans text-sm text-[#E63946]">{error}</p>}
      </Card>

      <Card className="rounded-2xl border border-[#E8E2D6] bg-[#FBF7EE] p-6 shadow-sm">
        <h2 className="font-dm-serif text-2xl text-[#18150F] mb-4">Your published slots</h2>

        {loading ? (
          <p className="font-dm-sans text-sm text-[#6F6B60]">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="font-dm-sans text-sm text-[#6F6B60]">
            No upcoming slots. Publish one above to open your calendar to
            learners.
          </p>
        ) : (
          <ul>
            {upcoming.map((slot, i) => (
              <li key={slot.id} className={`flex items-center gap-3 py-3 font-dm-sans ${i ? "border-t border-[#E8E2D6]" : ""}`}>
                <span className="flex-1 text-[15px] font-semibold text-[#18150F]">
                  {formatSlot(slot.slot_range)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[slot.status]}`}>
                  {slot.status}
                </span>
                {slot.status === "open" && (
                  <button
                    onClick={() => withdraw(slot.id)}
                    className="font-dm-sans text-sm text-[#6F6B60] hover:text-[#18150F] transition-colors"
                  >
                    Withdraw
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}