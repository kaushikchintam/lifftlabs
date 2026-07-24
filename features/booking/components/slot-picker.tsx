"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Learner booking (P3-08). Fetches a mentor's open slots and books via 
 * POST /api/sessions/, then hands the browser to Stripe Checkout. 
 */

interface OpenSlot {
    id: string;
    slot_range: string;
}

function parseRange(range: string): { start: Date; end: Date } | null {
    const m = range.match(/[\[\(]"?([^,"]+)"?\s*,\s*"?([^\)\]"]+)"?[\)\]]/);
    if (!m) return null;
    return { start: new Date(m[1]), end: new Date(m[2]) };
}

export function SlotPicker({ mentorId }: {mentorId: string }) {
    const [slots, setSlots] = useState<OpenSlot[]>([]);
    const [pricePence, setPricePence] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/mentors/${mentorId}/slots`);
            if (res.ok) {
                const body = await res.json();
                setSlots(body.slots);
                setPricePence(body.pricePence);
            }
            setLoading(false);
        })();
    }, [mentorId]);

    //Group by local day for scannable rendering
    const byDay = useMemo(() => { 
        const groups = new Map<string, Array<OpenSlot & { start: Date; end: Date }>>();
        for (const slot of slots) {
            const parsed = parseRange(slot.slot_range);
            if (!parsed) continue;
            const dayKey = new Intl.DateTimeFormat("en-GB", {
                weekday: "long",
                day: "numeric", 
                month: "long", 
            }).format(parsed.start);
            const list = groups.get(dayKey) ?? [];
            list.push({ ...slot, ...parsed });
            groups.set(dayKey, list);
        }
        return groups;
    }, [slots]);

    async function book(){
        if (!selected) return;
        setBooking(true);
        setError(null);

        const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slotId: selected }),
        });

        if (res.ok) {
            const { checkoutUrl } = await res.json();
            window.location.href = checkoutUrl; // hand off to Stripe
            return;
        }

        if (res.status === 409) {
            setError("That slot was just taken. Pick another time.");
            setSelected(null);
            // Refresh the list so the taken slot disappears
            const refreshed = await fetch(`/api/mentors/${mentorId}/slots`);
            if (refreshed.ok) setSlots((await refreshed.json()).slots); 
        } else {
            setError("Booking didn't go through try again.");
        }
        setBooking(false);
    }

    const timeFmt = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", 
        minute: "2-digit",
    });

    if (loading) {
        return <p className="text-sm text-muted-foreground">Loading available times...</p>;
    }

    if (slots.length === 0) {
        return (
            <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                    No open times right now. Check back soon - new slots are published regularly.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
      {[...byDay.entries()].map(([day, daySlots]) => (
        <div key={day}>
          <h3 className="font-serif text-base mb-2">{day}</h3>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setSelected(slot.id)}
                className={`font-archivo-black rounded-md border px-3 py-2 text-sm transition-colors ${
                  selected === slot.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50"
                }`}
              >
                {timeFmt.format(slot.start)}–{timeFmt.format(slot.end)}
              </button>
            ))}
          </div>
        </div>
      ))}
 
      <div className="font-archivo-black flex items-center gap-4 border-t pt-4">
        <Button onClick={book} disabled={!selected || booking}>
          {booking
            ? "Redirecting to payment…"
            : pricePence != null
              ? `Book session — £${(pricePence / 100).toFixed(2)}`
              : "Book session"}
        </Button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}