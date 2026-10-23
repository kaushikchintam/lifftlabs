"use client";

import { useCallback, useEffect, useState } from "react";
import { btnPrimary, btnSecondary } from "@/components/ui/lifft";
import { PageHeader } from "@/components/layout/page-header";
import { ExperienceForm } from "./experience-form";
import { ExperienceDetail, type ExperienceLog } from "./experience-detail";

export function ExperienceBoard() {
  const [logs, setLogs] = useState<ExperienceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/experience");
    if (res.ok) setLogs((await res.json()).logs);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const totalHours = Math.round(logs.reduce((sum, log) => sum + (Number(log.live_hours) || 0), 0));

  return (
    <>
      <PageHeader
        eyebrow="Evidence for interviews & applications"
        title="Experience log"
        subtitle="Log what you see and do — it becomes your interview material."
        action={
          <button onClick={() => setShowForm((v) => !v)} className={showForm ? btnSecondary : btnPrimary}>
            {showForm ? "Close" : "+ Log experience"}
          </button>
        }
      />

      {showForm ? (
        <ExperienceForm
          onDone={async () => {
            setShowForm(false);
            await refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="mb-6 w-full max-w-xs rounded-2xl border border-lf-line bg-white p-7">
          <p className="text-[15px] text-lf-muted">Total logged</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{totalHours}h</p>
          <p className="mt-1 text-[13px] text-lf-muted">Includes auto-accruing commitments</p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {loading && <p className="text-[15px] text-lf-muted">Loading…</p>}
        {!loading && logs.length === 0 && (
          <p className="text-[15px] text-lf-muted">Nothing logged yet — add your first experience above.</p>
        )}
        {logs.map((log) => (
          <ExperienceDetail key={log.id} log={log} onChange={refresh} />
        ))}
      </div>
    </>
  );
}
