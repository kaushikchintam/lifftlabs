"use client";

import { useRef, useState } from "react";
import { Avatar, btnSecondary } from "@/components/ui/lifft";
import { formatPence, formatSession } from "@/utils/format-date";
import { SESSION_MINUTES, getJourney, sessionPricing, tagLabel } from "@/features/journeys/config";
import type { MatchCard } from "@/features/matching/match";

export function MentorMatchCard({
  mentor,
  learnerTags,
  intakeId,
  previousSessionId,
  member = false,
}: {
  mentor: MatchCard;
  learnerTags: string[];
  /** null = no intake yet, so nothing to book against. */
  intakeId: string | null;
  previousSessionId?: string;
  /** LIFFT Plus: show the member price. */
  member?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const photoRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mine = new Set(learnerTags);
  const journeys = mentor.journeys.map((j) => getJourney(j)?.title).filter(Boolean).join(" · ");

  async function book(slotId: string) {
    setBusy(slotId);
    setError(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, intakeId, previousSessionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.checkoutUrl) {
      window.location.assign(data.checkoutUrl);
      return;
    }
    setBusy(null);
    setError(data.error === "slot_unavailable" ? "That time was just taken. Pick another." : "We couldn't start checkout. Please try again.");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-lf-line bg-white p-7">
      <div className="mb-4 flex flex-wrap items-start gap-4">
        {mentor.image ? (
          <>
            <button type="button" onClick={() => photoRef.current?.showModal()} className="flex-none cursor-zoom-in rounded-xl" aria-label={`View ${mentor.name}'s photo`}>
              <Avatar name={mentor.name} id={mentor.userId} src={mentor.image} size={112} />
            </button>
            {/* Native dialog: Esc closes it, clicking the backdrop closes it. */}
            <dialog
              ref={photoRef}
              onClick={(e) => e.target === e.currentTarget && photoRef.current?.close()}
              className="m-auto rounded-2xl bg-transparent p-0 backdrop:bg-black/70"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user upload on Supabase */}
              <img src={mentor.image} alt={mentor.name} className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain" />
            </dialog>
          </>
        ) : (
          <Avatar name={mentor.name} id={mentor.userId} size={64} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-medium">{mentor.name}</p>
          {mentor.headline && <p className="text-[17px] text-lf-muted">{mentor.headline}</p>}
          {journeys && <p className="text-[15px] text-lf-muted">{journeys}</p>}
        </div>
        {mentor.shared.length > 0 && (
          <span className="flex-none rounded-full bg-[#DDF3E6] px-3 py-1 text-[14px] text-[#1F7A4C]">
            Shares {mentor.shared.length} of your tags
          </span>
        )}
      </div>

      {mentor.bio && <p className="mb-4 text-[17px] text-lf-body">{mentor.bio}</p>}
      {mentor.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {mentor.tags.map((t) => (
            <span key={t} className={`rounded-full px-3 py-1 text-[14px] ${mine.has(t) ? "bg-lf-ink text-white" : "bg-lf-soft text-lf-body"}`}>
              {tagLabel(t)}
            </span>
          ))}
        </div>
      )}
      {mentor.credentials && <p className="mb-4 text-[15px] text-lf-muted">{mentor.credentials}</p>}

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-lf-line pt-5">
        <p className="text-[17px]">
          <span className="text-lf-muted">{SESSION_MINUTES} min · video · </span>
          <span className="font-semibold">{formatPence(sessionPricing(mentor.pricePence, member).amount)}</span>
          {member && <span className="ml-2 text-lf-muted line-through">{formatPence(mentor.pricePence)}</span>}
        </p>
        {!mentor.bookable ? (
          <span className="rounded-full bg-lf-soft px-4 py-2 text-[15px] text-lf-muted">Booking opens soon</span>
        ) : (
          !open && (
            <button className={btnSecondary} disabled={!intakeId} onClick={() => setOpen(true)}>
              View times
            </button>
          )
        )}
      </div>

      {open && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-[17px] font-medium">Pick a time — we&apos;ll hold it while you pay</p>
            <button className="text-[15px] text-lf-muted underline" onClick={() => setOpen(false)}>Close</button>
          </div>
          {mentor.slots.length ? (
            <div className="grid grid-cols-2 gap-3">
              {mentor.slots.map((start, i) => (
                <button
                  key={mentor.slotIds[i]}
                  disabled={!!busy}
                  onClick={() => book(mentor.slotIds[i])}
                  className="rounded-xl border-2 border-[#E0E0E0] px-4 py-3 text-left text-[16px] hover:border-lf-ink disabled:opacity-60"
                >
                  {busy === mentor.slotIds[i] ? "Opening checkout…" : formatSession(start)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-lf-muted">No open times in the next 14 days.</p>
          )}
          {error && <p className="mt-3 text-[15px] text-[#B42318]">{error}</p>}
        </div>
      )}
    </div>
  );
}
