"use client";

import { useState } from "react";

export interface ReflectionDraft {
  id?: string;
  session_id?: string | null;
  title?: string | null;
  description: string;
  feelings: string;
  evaluation: string;
  analysis: string;
  conclusion: string;
  action_plan: string;
}

const FIELDS: { key: keyof Omit<ReflectionDraft, "id" | "session_id" | "title">; label: string; prompt: string }[] = [
  { key: "description", label: "Description", prompt: "What happened?" },
  { key: "feelings", label: "Feelings", prompt: "What were you thinking and feeling?" },
  { key: "evaluation", label: "Evaluation", prompt: "What was good and bad about the experience?" },
  { key: "analysis", label: "Analysis", prompt: "What sense can you make of the situation?" },
  { key: "conclusion", label: "Conclusion", prompt: "What else could you have done?" },
  { key: "action_plan", label: "Action plan", prompt: "If it arose again, what would you do?" },
];

const EMPTY: ReflectionDraft = {
  description: "",
  feelings: "",
  evaluation: "",
  analysis: "",
  conclusion: "",
  action_plan: "",
};

export function ReflectionForm({
  initial,
  sessionMeta,
  onClose,
  onSaved,
}: {
  initial?: ReflectionDraft;
  sessionMeta?: { session_id: string; mentor_name: string; scheduled_at: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [fields, setFields] = useState<ReflectionDraft>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initial?.id;
  const isSessionBased = !!sessionMeta || !!initial?.session_id;

  function setField(key: keyof typeof EMPTY, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!fields.description.trim()) {
      setError("Description is required.");
      return;
    }
    setSaving(true);
    setError(null);

    const body = isSessionBased
      ? { session_id: sessionMeta?.session_id ?? initial?.session_id, ...fields }
      : { title: title.trim() || "Untitled reflection", ...fields };

    const res = isEditing
      ? await fetch(`/api/gibbs/${initial!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        })
      : await fetch("/api/gibbs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const { error } = await res.json().catch(() => ({ error: "save_failed" }));
      setError(error ?? "Something went wrong.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#D8D2C2] bg-white px-3 py-2 font-dm-sans text-sm text-ink placeholder:text-ink-faintest focus:border-brand focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-dm-serif text-2xl text-ink">
              {isSessionBased
                ? `Session with ${sessionMeta?.mentor_name ?? "your mentor"}`
                : isEditing
                ? "Edit reflection"
                : "New reflection"}
            </h3>
            {sessionMeta && (
              <p className="font-dm-sans text-sm text-ink-muted">
                {new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(sessionMeta.scheduled_at))}
              </p>
            )}
          </div>
          <button onClick={onClose} className="font-dm-sans text-sm text-ink-muted hover:text-ink transition-colors">
            Close
          </button>
        </div>

        {!isSessionBased && (
          <div className="mt-4">
            <label className="mb-1 block font-dm-sans text-sm text-ink-muted">Title</label>
            <input className={inputClass} placeholder="What's this about?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        )}

        <div className="mt-4 space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block font-dm-sans text-sm font-semibold text-ink">{f.label}</label>
              <p className="mb-1 font-dm-sans text-xs text-ink-muted">{f.prompt}</p>
              <textarea
                className={inputClass}
                rows={3}
                value={fields[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-3 font-dm-sans text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-brand px-5 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save reflection"}
          </button>
          <button onClick={onClose} className="rounded-full border border-[#D8D2C2] px-5 py-2 font-dm-sans text-sm text-ink-muted hover:text-ink transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
