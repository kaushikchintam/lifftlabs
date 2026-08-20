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
    <div className="flex gap-3 border-b border-[#ECE7DD] py-4 last:border-b-0">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#F1ECE0] text-ink-muted">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-dm-sans font-semibold text-ink">{resource.title}</span>
          {resource.url ? (
            <a href={resource.url} target="_blank" rel="noreferrer" className="font-dm-sans text-sm text-ink-muted hover:text-brand hover:underline">
              {resource.sourceLabel}
            </a>
          ) : (
            <span className="font-dm-sans text-sm text-ink-muted">{resource.sourceLabel}</span>
          )}
        </div>
        <p className="mt-1 font-dm-sans text-sm text-ink-muted">{resource.description}</p>

        {editing ? (
          <div ref={editRef} className="mt-2 flex items-start gap-2">
            <textarea
              className="flex-1 rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm text-ink focus:border-brand focus:outline-none"
              placeholder="What did this show you?"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : reflection ? (
          <button onClick={() => setEditing(true)} className="mt-2 block text-left">
            <span className="font-dm-sans text-sm italic text-ink-body">&ldquo;{reflection}&rdquo;</span>
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="mt-2 flex items-center gap-1.5 font-dm-sans text-xs text-ink-muted hover:text-ink transition-colors"
          >
            <PenLine size={12} /> Add a reflection
          </button>
        )}
      </div>
    </div>
  );
}
