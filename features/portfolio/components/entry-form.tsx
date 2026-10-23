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
        // ponytail: reuses the old linked_specialty column for the linked medical school
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
    "w-full rounded-xl border border-lf-line-strong bg-white px-4 py-3 text-[15px] text-lf-ink placeholder:text-[#9A9A9A] focus:border-lf-ink focus:outline-none";
  const labelClass = "text-sm text-lf-muted mb-1 block";

  return (
    <div className="space-y-4 rounded-2xl border border-lf-line bg-lf-soft p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} placeholder="e.g. EPQ on antibiotic resistance" value={title} onChange={(e) => setTitle(e.target.value)} />
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
          <input className={inputClass} placeholder="School, charity, hospital, course…" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Linked medical school (optional)</label>
          <input className={inputClass} placeholder="e.g. King's College London" value={linkedSpecialty} onChange={(e) => setLinkedSpecialty(e.target.value)} />
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
          className="rounded-full bg-lf-ink px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save entry"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-lf-line-strong px-5 py-2 text-sm text-lf-muted hover:text-lf-ink transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
