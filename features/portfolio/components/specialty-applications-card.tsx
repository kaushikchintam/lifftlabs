"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

interface Application {
  id: string;
  specialty: string;
  status: string;
  target_year: number | null;
  notes: string | null;
}

const STATUS_OPTIONS = [
  { value: "portfolio_building", label: "Portfolio building" },
  { value: "application_submitted", label: "Application submitted" },
  { value: "interview_invited", label: "Interview invited" },
  { value: "ranked_offer", label: "Ranked / offer" },
];

export function SpecialtyApplicationsCard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [status, setStatus] = useState("portfolio_building");
  const [targetYear, setTargetYear] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/specialty-applications");
    if (res.ok) {
      const { applications } = await res.json();
      setApplications(applications);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSave() {
    if (!specialty.trim()) return;
    setSaving(true);
    const res = await fetch("/api/specialty-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        specialty,
        status,
        target_year: targetYear ? Number(targetYear) : undefined,
        notes: notes || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSpecialty("");
      setStatus("portfolio_building");
      setTargetYear("");
      setNotes("");
      setShowForm(false);
      refresh();
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    await fetch(`/api/specialty-applications?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleRemove(id: string) {
    await fetch(`/api/specialty-applications?id=${id}`, { method: "DELETE" });
    refresh();
  }

  const inputClass =
    "rounded-lg border border-[#D8D2C2] bg-white px-3 py-2 font-dm-sans text-sm text-ink placeholder:text-ink-faintest focus:border-brand focus:outline-none";

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-dm-sans font-semibold text-ink">Specialty applications</h4>
        <button onClick={() => setShowForm((v) => !v)} className="font-dm-sans text-sm text-brand hover:underline">
          {showForm ? "Close" : "+ Track application"}
        </button>
      </div>
      <p className="mt-1 font-dm-sans text-sm text-ink-muted">
        Track each specialty training application against its stage — your Portfolio evidence rolls up under it.
      </p>

      {applications.length > 0 && (
        <ul className="mt-4 space-y-2">
          {applications.map((app) => (
            <li key={app.id} className="flex items-center justify-between gap-3 border-t border-[#ECE7DD] pt-2 first:border-t-0 first:pt-0">
              <div>
                <span className="font-dm-sans text-sm text-ink">
                  {app.specialty}
                  {app.target_year && <span className="text-ink-muted"> · {app.target_year}</span>}
                </span>
                {app.notes && (
                  <p className="font-dm-sans text-xs text-ink-muted mt-0.5">{app.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className={inputClass}
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button onClick={() => handleRemove(app.id)} className="text-ink-faintest hover:text-ink transition-colors">
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input className={inputClass} placeholder="Specialty (e.g. IMT, GP)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input className={inputClass} placeholder="Target year (optional)" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} />
          <input className={inputClass} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
