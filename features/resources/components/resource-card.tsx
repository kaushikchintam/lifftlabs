"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Wrench, Monitor, BookOpen, Headphones, Film, PenLine, type LucideIcon } from "lucide-react";
import type { Resource } from "./data/resources";

const ICONS: Record<string, LucideIcon> = { Globe, Wrench, Monitor, BookOpen, Headphones, Film };

export function ResourceCard({
  resource,
  reflection,
  onSaved,
}: {
  resource: Resource;
  reflection: string | null;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reflection ?? "");
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  const Icon = ICONS[resource.icon] ?? Globe;

  useEffect(() => {
    if (!editing) return;

    function handleClickOutside(e: MouseEvent) {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setDraft(reflection ?? "");
        setEditing(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, reflection]);

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    const res = await fetch("/api/resources/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceSlug: resource.slug, reflection: draft }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      onSaved();
    }
  }

  return (
    <div className="flex gap-3 border-b border-lf-line py-4 last:border-b-0">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-lf-soft text-lf-muted">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-lf-ink">{resource.title}</span>
          {resource.url ? (
            <a href={resource.url} target="_blank" rel="noreferrer" className="text-sm text-lf-muted hover:text-lf-ink hover:underline">
              {resource.sourceLabel}
            </a>
          ) : (
            <span className="text-sm text-lf-muted">{resource.sourceLabel}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-lf-muted">{resource.description}</p>

        {editing ? (
          <div ref={editRef} className="mt-2 flex items-start gap-2">
            <textarea
              className="flex-1 rounded-lg border border-lf-line-strong px-3 py-2 text-sm text-lf-ink focus:border-lf-ink focus:outline-none"
              placeholder="What did this show you?"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-lf-ink px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : reflection ? (
          <button onClick={() => setEditing(true)} className="mt-2 block text-left">
            <span className="text-sm italic text-lf-body">&ldquo;{reflection}&rdquo;</span>
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="mt-2 flex items-center gap-1.5 text-xs text-lf-muted hover:text-lf-ink transition-colors"
          >
            <PenLine size={12} /> Add a reflection
          </button>
        )}
      </div>
    </div>
  );
}
