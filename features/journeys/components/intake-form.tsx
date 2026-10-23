"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import {
  answersToQuery,
  getJourney,
  isComplete,
  tagLabel,
  tagsFor,
  type Answers,
} from "@/features/journeys/config";
import { btnPrimary } from "@/components/ui/lifft";

export function IntakeForm({ slug, initial, signedIn }: { slug: string; initial: Answers; signedIn: boolean }) {
  const journey = getJourney(slug)!;
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tags = tagsFor(journey, answers);
  const { light, dark } = journey.accent;

  async function next() {
    if (!signedIn) return router.push(`/journey/${slug}/account?${answersToQuery(answers)}`);
    setBusy(true);
    const res = await fetch("/api/intakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journey: slug, answers }),
    });
    if (res.ok) return router.push(`/mentors?journey=${slug}`);
    setBusy(false);
    setError("We couldn't save your answers. Please try again.");
  }

  function toggle(qid: string, idx: number, multi?: boolean) {
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      const next = multi
        ? cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]
        : [idx];
      return { ...prev, [qid]: next };
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-lf-line bg-white p-8">
        {journey.questions.map((q) => (
          <fieldset key={q.id} className="mb-7 last:mb-0">
            <legend className="mb-4 text-[17px] font-medium">{q.label}</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {q.options.map((o, i) => {
                const on = answers[q.id]?.includes(i) ?? false;
                return (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(q.id, i, q.multi)}
                    className="flex min-h-16 items-center justify-between rounded-xl border-2 px-5 py-4 text-left text-[17px] transition-colors"
                    style={on ? { background: light, borderColor: dark } : { borderColor: "#E0E0E0" }}
                  >
                    {o.label}
                    {on && <Check size={18} style={{ color: dark }} />}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {tags.length > 0 && (
          <div className="mt-8 border-t border-lf-line pt-6">
            <p className="mb-3 text-[15px] text-lf-muted">We&apos;ll match you on</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full px-4 py-1.5 text-[15px]" style={{ background: light, color: dark }}>
                  {tagLabel(t)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-[15px] text-[#B42318]">{error}</p>}
      <button
        className={`${btnPrimary} mt-8`}
        disabled={!isComplete(journey, answers) || busy}
        onClick={next}
      >
        Find my mentor <ArrowRight size={18} />
      </button>
    </>
  );
}
