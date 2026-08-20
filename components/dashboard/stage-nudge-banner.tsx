"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const NEXT_STAGE: Record<"applicant" | "med_student", { value: string; label: string }> = {
    applicant: { value: "med_student", label: "Medical Student" }, 
    med_student: { value: "resident", label: "Resident doctor" },
};

const DISMISS_KEY = "lifft-stage-nudge-dismissed";
const DISMISS_DAYS = 30;

export function StageNudgeBanner({ currentStage }: { currentStage: "applicant" | "med_student" }) {
    const [dismissed, setDismissed] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
        setDismissed(Date.now() < dismissedUntil);
    }, []);

    if (dismissed) return null;

    const next = NEXT_STAGE[currentStage];

    async function handleYes() {
        setSubmitting(true);
        const res = await fetch("/api/stage-transitions", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ stage: next.value, reason: "self_reported_nudge" }),
        });
        if (res.ok) {
            window.location.href = "/dashboard";
        } else { 
            setSubmitting(false);
        }
    }

    function handleDismiss() {
        localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
        setDismissed(true);
    }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-brand-tint bg-brand-tint/40 px-5 py-4 mb-6">
      <p className="font-dm-sans text-sm text-ink">
        It's been a while since you joined — have you started {next.label.toLowerCase()}?
      </p>
      <div className="flex items-center gap-3 flex-none">
        <button
          onClick={handleYes}
          disabled={submitting}
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          Yes, move me to {next.label} <ArrowRight size={14} />
        </button>
        <button
          onClick={handleDismiss}
          className="font-dm-sans text-sm text-ink-muted hover:text-ink transition-colors"
        >
          Not yet
        </button>
      </div>
    </div>
  ); 
}