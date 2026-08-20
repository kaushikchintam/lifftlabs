"use client";

import { useState } from "react";

type Stage = "applicant" | "med_student" | "resident";

const STAGE_LABELS: Record<Stage, string> = {
  applicant: "Applicant",
  med_student: "Medical student",
  resident: "Resident doctor",
};

const STAGE_OPTIONS: Stage[] = ["applicant", "med_student", "resident"];

export function StageSection({ currentStage }: { currentStage: Stage }) {
  const [picking, setPicking] = useState(false);
  const [pendingStage, setPendingStage] = useState<Stage | null>(null);
  const [saving, setSaving] = useState(false);

  async function confirmChange() {
    if (!pendingStage) return;
    setSaving(true);
    const res = await fetch("/api/stage-transitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: pendingStage, reason: "manual_settings_change" }),
    });
    setSaving(false);
    if (res.ok) {
      // Full reload — proxy.ts backfills the stage cookie from the DB on
      // the next request, same as the stage-nudge banner does after a write.
      window.location.reload();
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-[#ECE7DD] px-6 py-4 last:border-b-0">
      <div>
        <p className="font-dm-sans font-semibold text-ink">Stage</p>
        <p className="font-dm-sans text-sm text-ink-muted">{STAGE_LABELS[currentStage]}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setPicking((v) => !v)}
          className="font-dm-sans text-sm font-semibold text-brand hover:underline"
        >
          Change
        </button>

        {picking && (
          <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[#ECE7DD] bg-white p-1.5 shadow-lg">
            {STAGE_OPTIONS.map((stage) => (
              <button
                key={stage}
                onClick={() => {
                  setPicking(false);
                  if (stage !== currentStage) setPendingStage(stage);
                }}
                className={`block w-full rounded-lg px-3 py-2 text-left font-dm-sans text-sm transition-colors ${
                  stage === currentStage ? "text-ink-faintest" : "text-ink hover:bg-[#FAF8F3]"
                }`}
              >
                {STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
        )}
      </div>

      {pendingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="font-dm-serif text-xl text-ink">Switch to {STAGE_LABELS[pendingStage]}?</h3>
            <p className="mt-2 font-dm-sans text-sm text-ink-muted">
              This changes which tabs and dashboard you see across the whole platform — your logged
              evidence, portfolio, and reflections all carry over.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingStage(null)}
                disabled={saving}
                className="rounded-full border border-[#ECE7DD] px-4 py-2 font-dm-sans text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmChange}
                disabled={saving}
                className="rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                {saving ? "Switching…" : "Yes, switch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
