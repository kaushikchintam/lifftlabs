"use client";

import { useState } from "react";
import { Briefcase, HeartHandshake, FlaskConical, Flag, type LucideIcon } from "lucide-react";
import { EntryCard, type PortfolioEntry } from "./entry-card";
import { EntryForm } from "./entry-form";
import { PORTFOLIO_CATEGORIES, type PortfolioCategory } from "./data/portfolio-options";

const ICONS: Record<string, LucideIcon> = { Briefcase, HeartHandshake, FlaskConical, Flag };

export function CategorySection({
  category,
  entries,
  onChange,
}: {
  category: PortfolioCategory;
  entries: PortfolioEntry[];
  onChange: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const meta = PORTFOLIO_CATEGORIES.find((c) => c.value === category)!;
  const Icon = ICONS[meta.icon];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[#2F7A55]" />}
        <h3 className="text-2xl font-bold tracking-tight">{meta.label}</h3>
        <span className="text-sm text-lf-muted">{entries.length} logged</span>
      </div>

      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onChange={onChange} />
      ))}

      {showForm ? (
        <EntryForm
          category={category}
          onDone={() => { setShowForm(false); onChange(); }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-lf-muted hover:text-lf-ink transition-colors"
        >
          + Add to {meta.label}
        </button>
      )}
    </div>
  );
}
