"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/lifft";

/** Learner's intake answers with per-answer Shared/Hidden toggles. */
export function AboutMeCard({
  intakeId,
  mentorName,
  rows,
  initialShared,
}: {
  intakeId: string;
  mentorName: string;
  rows: { id: string; question: string; answer: string }[];
  initialShared: string[];
}) {
  const [shared, setShared] = useState(new Set(initialShared));

  async function toggle(id: string) {
    const next = new Set(shared);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setShared(next);
    const res = await fetch(`/api/intakes/${intakeId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharedKeys: [...next] }),
    });
    if (!res.ok) setShared(shared); // roll back
  }

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-7">
      <h2 className="text-[23px] font-medium">About me</h2>
      <p className="mb-2 text-[17px] text-lf-muted">
        {mentorName} reads this before you meet. You choose what&apos;s shared.
      </p>
      <ul>
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-4 border-t border-lf-line py-4">
            <div>
              <p className="text-[15px] text-lf-muted">{r.question}</p>
              <p className="text-[19px]">{r.answer}</p>
            </div>
            <button onClick={() => toggle(r.id)} aria-pressed={shared.has(r.id)} title="Toggle sharing">
              <Pill tone={shared.has(r.id) ? "shared" : "hidden"}>{shared.has(r.id) ? "Shared" : "Hidden"}</Pill>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
