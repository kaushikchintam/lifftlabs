"use client";

import { useCallback, useEffect, useState } from "react";
import { ExperienceForm } from "@/features/experience/components/experience-form";
import { ExperienceDetail, type ExperienceLog } from "@/features/experience/components/experience-detail";

export default function ExperiencePage() {
  const [logs, setLogs] = useState<ExperienceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/experience");
    if (res.ok) {
      const { logs } = await res.json();
      setLogs(logs);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const totalHours = Math.round(
    logs.reduce((sum, log) => sum + (Number(log.live_hours) || 0), 0)
  );

  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 font-dm-sans text-xs font-bold uppercase tracking-wide text-brand">
              <span className="inline-block h-px w-4 bg-brand" />
              Evidence for interviews & applications
            </span>
            <h1 className="font-dm-serif text-5xl text-ink">Experience log</h1>
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex-none rounded-full bg-brand px-5 py-2.5 font-dm-sans text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {showForm ? "Close" : "+ Log experience"}
          </button>
        </div>

        {showForm ? (
          <ExperienceForm
            onDone={async () => {
              setShowForm(false);
              await refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="w-full max-w-xs rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
            <p className="font-dm-sans text-sm text-ink-muted">Total logged</p>
            <p className="mt-1 font-dm-serif text-4xl text-ink">{totalHours}h</p>
            <p className="mt-1 font-dm-sans text-xs text-ink-muted">
              Includes auto-accruing commitments
            </p>
          </div>
        )}

        <div className="space-y-6">
          {loading && <p className="font-dm-sans text-sm text-ink-muted">Loading…</p>}

          {!loading && logs.length === 0 && (
            <p className="font-dm-sans text-sm text-ink-muted">
              Nothing logged yet — add your first experience above.
            </p>
          )}

          {logs.map((log) => (
            <ExperienceDetail key={log.id} log={log} onChange={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
