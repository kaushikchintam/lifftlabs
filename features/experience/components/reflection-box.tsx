"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

export function ReflectionBox({
  experienceId,
  reflection,
  onChange,
}: {
  experienceId: string;
  reflection: string | null;
  onChange: () => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reflection ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/experience/${experienceId}/reflection`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection: draft.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      await onChange();
    }
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What did this change about how you see the move?"
          rows={2}
          className="w-full rounded-xl border border-lf-line bg-white px-4 py-2.5 text-sm text-lf-ink outline-none focus:border-lf-ink"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDraft(reflection ?? "");
              setEditing(false);
            }}
            className="rounded-full border border-lf-line px-4 py-1.5 text-xs font-semibold text-lf-muted transition-colors hover:text-lf-ink"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-lf-ink px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-lf-muted">
        {reflection || "No reflection yet — what did this change about how you see the move?"}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="flex flex-none items-center gap-1.5 text-sm font-semibold text-lf-ink transition-colors hover:text-lf-ink"
      >
        <Pencil size={13} /> Reflect
      </button>
    </div>
  );
}
