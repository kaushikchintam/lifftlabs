"use client";

import { useState } from "react";
import { PORTFOLIO_TYPES, type PortfolioCategory } from "./data/portfolio-options";

export function EntryForm({
  category,
  onDone,
  onCancel,
}: {
  category: PortfolioCategory;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [linkedSpecialty, setLinkedSpecialty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const typeOptions = PORTFOLIO_TYPES[category];

  async function handleSave() {
    if (!title.trim() || !type || !organisation.trim() || !startDate || !reflection.trim()) return;
    setSaving(true);
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title,
        type,
        organisation,
        linked_specialty: linkedSpecialty || undefined,
        start_date: startDate,
        end_date: endDate || undefined,
        reflection,
      }),
    });
    setSaving(false);
    if (res.ok) onDone();
  }

  const inputClass =
    "w-full rounded-lg border border-[#D8D2C2] bg-white px-3 py-2 font-dm-sans text-sm text-ink placeholder:text-ink-faintest focus:border-brand focus:outline-none";
  const labelClass = "font-dm-sans text-sm text-ink-muted mb-1 block";

  return (
    <div className="rounded-2xl bg-brand-tint/40 border border-brand-tint p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} placeholder="e.g. Sepsis pathway QI project" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Select…</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Organisation / venue</label>
          <input className={inputClass} placeholder="Trust, society, journal…" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Linked specialty (optional)</label>
          <input className={inputClass} placeholder="e.g. Cardiology" value={linkedSpecialty} onChange={(e) => setLinkedSpecialty(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>End date (if a range)</label>
          <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Reflection / takeaway</label>
        <textarea
          className={inputClass}
          placeholder="What it showed, what you'd say about it at interview…"
          rows={3}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brand px-5 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save entry"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-[#D8D2C2] px-5 py-2 font-dm-sans text-sm text-ink-muted hover:text-ink transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
