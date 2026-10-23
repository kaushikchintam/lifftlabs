"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnPrimary, btnSecondary } from "@/components/ui/lifft";

async function openStripe(path: string, setBusy: (b: boolean) => void) {
  setBusy(true);
  const res = await fetch(path, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (data.url) window.location.href = data.url;
  else setBusy(false);
}

export function SetupPayoutsButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button className={btnPrimary} disabled={busy} onClick={() => openStripe("/api/mentor/stripe/onboard", setBusy)}>
      {busy ? "Opening Stripe…" : "Set up payouts"}
    </button>
  );
}

export function ManagePayoutsLink() {
  const [busy, setBusy] = useState(false);
  return (
    <button className="text-[15px] text-lf-ink underline" disabled={busy} onClick={() => openStripe("/api/mentor/stripe/manage", setBusy)}>
      Manage payouts
    </button>
  );
}

/** Pause/resume — mentor's own (default) or an admin acting on a mentor. */
export function PauseButton({ paused, mentorId, primary = true }: { paused: boolean; mentorId?: string; primary?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={primary ? btnPrimary : btnSecondary}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(mentorId ? `/api/admin/mentors/${mentorId}/pause` : "/api/mentor/pause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paused: !paused }),
        });
        setBusy(false);
        router.refresh();
      }}
    >
      {paused ? "Resume bookings" : mentorId ? "Pause" : "Pause bookings"}
    </button>
  );
}
