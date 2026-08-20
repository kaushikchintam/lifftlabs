"use client";

import { useCallback, useEffect, useState } from "react";

interface Rotation {
  id: string;
  specialty: string;
  start_date: string;
  end_date: string | null;
  is_genuine_interest: boolean;
}

export function ClinicalRotationsCard() {
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interest, setInterest] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/clinical-rotations");
    if (res.ok) {
      const { rotations } = await res.json();
      setRotations(rotations);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSave() {
    if (!specialty.trim() || !startDate) return;
    setSaving(true);
    const res = await fetch("/api/clinical-rotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        specialty,
        start_date: startDate,
        end_date: endDate || undefined,
        is_genuine_interest: interest,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSpecialty("");
      setStartDate("");
      setEndDate("");
      setInterest(false);
      setShowForm(false);
      refresh();
    }
  }

  const inputClass =
    "rounded-lg border border-[#D8D2C2] bg-white px-3 py-2 font-dm-sans text-sm text-ink placeholder:text-ink-faintest focus:border-brand focus:outline-none";

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-dm-sans font-semibold text-ink">Clinical rotations</h4>
        <button onClick={() => setShowForm((v) => !v)} className="font-dm-sans text-sm text-brand hover:underline">
          {showForm ? "Close" : "+ Add rotation"}
        </button>
      </div>
      <p className="mt-1 font-dm-sans text-sm text-ink-muted">
        Log each placement as you go — flagging one as &ldquo;genuine interest&rdquo; surfaces it when you start a Portfolio entry in that specialty.
      </p>

      {showForm && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input className={inputClass} placeholder="Specialty (e.g. Surgery)" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <label className="flex items-center gap-1.5 font-dm-sans text-sm text-ink-muted">
            <input type="checkbox" checked={interest} onChange={(e) => setInterest(e.target.checked)} />
            Interest
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brand px-5 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}

      {rotations.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {rotations.map((r) => (
            <li key={r.id} className="font-dm-sans text-sm text-ink-body">
              {r.specialty}
              {r.is_genuine_interest && <span className="ml-1.5 text-xs text-brand">interest</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
