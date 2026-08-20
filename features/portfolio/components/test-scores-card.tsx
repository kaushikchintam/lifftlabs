"use client";

import { useCallback, useEffect, useState } from "react";

interface TestScore {
  id: string;
  test_type: string;
  sitting_date: string;
  score: string;
}

const TEST_TYPE_OPTIONS = [
  { value: "ucat", label: "UCAT" },
  { value: "gamsat", label: "GAMSAT" },
  { value: "mcat", label: "MCAT" },
];

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function TestScoresCard() {
  const [scores, setScores] = useState<TestScore[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [testType, setTestType] = useState("ucat");
  const [score, setScore] = useState("");
  const [sittingDate, setSittingDate] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/test-scores");
    if (res.ok) {
      const { scores } = await res.json();
      setScores(scores);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSave() {
    if (!score.trim() || !sittingDate) return;
    setSaving(true);
    const res = await fetch("/api/test-scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_type: testType, score, sitting_date: sittingDate }),
    });
    setSaving(false);
    if (res.ok) {
      setScore("");
      setSittingDate("");
      setShowForm(false);
      refresh();
    }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/test-scores?id=${id}`, { method: "DELETE" });
    refresh();
  }

  const inputClass =
    "rounded-lg border border-[#D8D2C2] bg-white px-3 py-2 font-dm-sans text-sm text-ink placeholder:text-ink-faintest focus:border-brand focus:outline-none";

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-dm-sans font-semibold text-ink">Test scores</h4>
        <button onClick={() => setShowForm((v) => !v)} className="font-dm-sans text-sm text-brand hover:underline">
          {showForm ? "Close" : "+ Add sitting"}
        </button>
      </div>

      {scores.length === 0 && !showForm && (
        <p className="mt-1 font-dm-sans text-sm text-ink-muted">
          No sittings logged yet — UCAT, GAMSAT or MCAT results feed straight into your application checklist.
        </p>
      )}

      {scores.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {scores.map((s) => (
            <li key={s.id} className="flex items-center justify-between font-dm-sans text-sm text-ink-body">
              <span>
                {TEST_TYPE_OPTIONS.find((t) => t.value === s.test_type)?.label ?? s.test_type} — {s.score}
                <span className="text-ink-muted"> · {dateFmt.format(new Date(s.sitting_date))}</span>
              </span>
              <button onClick={() => handleRemove(s.id)} className="text-ink-faintest hover:text-ink transition-colors text-xs">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select className={inputClass} value={testType} onChange={(e) => setTestType(e.target.value)}>
            {TEST_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input className={inputClass} placeholder="Score / band" value={score} onChange={(e) => setScore(e.target.value)} />
          <input type="date" className={inputClass} value={sittingDate} onChange={(e) => setSittingDate(e.target.value)} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brand px-5 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
