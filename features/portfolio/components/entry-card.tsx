"use client";

import { useState } from "react";
import { Paperclip, ShieldCheck, Shield, Trash2 } from "lucide-react";
import { PORTFOLIO_TYPES, type PortfolioCategory } from "./data/portfolio-options";

export interface PortfolioAttachment {
  id: string;
  file_name: string;
  kind: string;
  signedUrl: string;
}

export interface PortfolioEntry {
  id: string;
  category: PortfolioCategory;
  title: string;
  type: string;
  organisation: string;
  linked_specialty: string | null;
  start_date: string;
  end_date: string | null;
  reflection: string;
  signed_off_at: string | null;
  signed_off_by: string | null;
  attachments: PortfolioAttachment[];
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" });

function typeLabel(category: PortfolioCategory, type: string) {
  return PORTFOLIO_TYPES[category].find((t) => t.value === type)?.label ?? type;
}

export function EntryCard({
  entry,
  onChange,
}: {
  entry: PortfolioEntry;
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const dateRange =
    entry.end_date && entry.end_date !== entry.start_date
      ? `${dateFmt.format(new Date(entry.start_date))} – ${dateFmt.format(new Date(entry.end_date))}`
      : dateFmt.format(new Date(entry.start_date));

  async function handleDelete() {
    await fetch(`/api/portfolio/${entry.id}`, { method: "DELETE" });
    onChange();
  }

  async function handleSignOff() {
    await fetch(`/api/portfolio/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign_off: true }),
    });
    onChange();
  }

  async function handleAddEvidence(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("kind", "evidence");
    form.append("file", file);
    await fetch(`/api/portfolio/${entry.id}/attachments`, { method: "POST", body: form });
    setUploading(false);
    onChange();
  }

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-lf-ink">{entry.title}</h4>
            <span className="rounded-full bg-lf-soft px-2.5 py-0.5 text-xs text-lf-muted">
              {typeLabel(entry.category, entry.type)}
            </span>
            {entry.linked_specialty && (
              <span className="rounded-full bg-lf-soft px-2.5 py-0.5 text-xs text-lf-muted">
                {entry.linked_specialty}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-lf-muted">
            {entry.organisation} · {dateRange}
          </p>
        </div>
        <button onClick={handleDelete} title="Delete" className="text-lf-muted hover:text-lf-ink transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <p className="mt-3 text-sm text-lf-body">{entry.reflection}</p>

      {entry.attachments.length > 0 && (
        <ul className="mt-3 space-y-1">
          {entry.attachments.map((a) => (
            <li key={a.id}>
              <a href={a.signedUrl} target="_blank" rel="noreferrer" className="text-xs text-[#2F7A55] hover:underline">
                {a.file_name}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-lf-muted hover:text-lf-ink transition-colors cursor-pointer">
          <Paperclip size={13} />
          {uploading ? "Uploading…" : "Add evidence"}
          <input type="file" className="hidden" onChange={handleAddEvidence} disabled={uploading} />
        </label>

        {entry.signed_off_at ? (
          <span className="flex items-center gap-1.5 text-xs text-[#2F7A55]">
            <ShieldCheck size={13} /> Signed off
          </span>
        ) : (
          <button
            onClick={handleSignOff}
            className="flex items-center gap-1.5 text-xs text-lf-muted hover:text-lf-ink transition-colors"
          >
            <Shield size={13} /> Mark signed off
          </button>
        )}
      </div>
    </div>
  );
}
