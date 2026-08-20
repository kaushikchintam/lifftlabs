"use client";

import { useEffect, useState } from "react";
import type { Note, Step } from "./checklist-board";

const MAX_NOTES = 7;

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/**
 * Notes for one step — up to 7, each independently addable/editable/
 * deletable, plus a "Combine" toggle that merges them into one numbered
 * box (1 to 7, creation order) instead of separate rows. Combine is a
 * display-only toggle — it writes nothing back to the DB.
 */
export function StepNotes({
  step,
  onChange,
  autoOpen,
}: {
  step: Step;
  onChange: () => void | Promise<void>;
  autoOpen?: boolean;
}) {
  const notes = step.checklist_notes;
  const [editingId, setEditingId] = useState<string | null>(null); // null while composing a new note
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [combined, setCombined] = useState(false);
  const [saving, setSaving] = useState(false);

  // "Add a step" chains straight into "Add a note" — this step's composer
  // arms itself the moment it renders for the first time after creation.
  useEffect(() => {
    if (autoOpen) setComposing(true);
  }, [autoOpen]);

  function startNew() {
    setEditingId(null);
    setDraft("");
    setComposing(true);
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setDraft(note.content);
    setComposing(true);
  }

  function cancel() {
    setComposing(false);
    setEditingId(null);
    setDraft("");
  }

  async function save() {
    const content = draft.trim();
    if (!content) return;
    setSaving(true);
    const res = editingId
      ? await fetch(`/api/checklist/notes/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })
      : await fetch(`/api/checklist/steps/${step.id}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
    setSaving(false);
    if (res.ok) {
      cancel();
      await onChange();
    }
  }

  async function remove() {
    if (!editingId) return;
    const res = await fetch(`/api/checklist/notes/${editingId}`, { method: "DELETE" });
    if (res.ok) {
      cancel();
      await onChange();
    }
  }

  if (combined && notes.length > 0) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[#ECE7DD] bg-[#FAF8F3] px-4 py-3 font-dm-sans text-sm text-ink">
          {notes.map((n, i) => (
            <p key={n.id} className={i > 0 ? "mt-2" : ""}>
              {i + 1}. {n.content}
            </p>
          ))}
        </div>
        <button
          onClick={() => setCombined(false)}
          className="font-dm-sans text-xs text-ink-muted transition-colors hover:text-brand"
        >
          Show separately
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => startEdit(note)}
          className="block w-full rounded-xl border border-[#ECE7DD] bg-[#FAF8F3] px-4 py-2.5 text-left font-dm-sans text-sm text-ink transition-colors hover:border-brand/40"
        >
          {note.content}
          <span className="ml-2 text-ink-faintest">
            — You · {dateFmt.format(new Date(note.created_at))}
          </span>
        </button>
      ))}

      {composing && (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="How's this going?"
            rows={2}
            className="w-full rounded-xl border border-[#ECE7DD] bg-white px-4 py-2.5 font-dm-sans text-sm text-ink outline-none focus:border-brand"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={remove}
              disabled={!editingId}
              className="rounded-full border border-[#ECE7DD] px-3 py-1.5 font-dm-sans text-xs font-semibold text-danger transition-colors hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Delete
            </button>
            {notes.length > 1 && (
              <button
                onClick={() => setCombined(true)}
                className="rounded-full border border-[#ECE7DD] px-3 py-1.5 font-dm-sans text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                Combine
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={cancel}
              className="rounded-full border border-[#ECE7DD] px-4 py-1.5 font-dm-sans text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !draft.trim()}
              className="rounded-full bg-brand px-4 py-1.5 font-dm-sans text-xs font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {!composing && notes.length < MAX_NOTES && (
        <button
          onClick={startNew}
          className="flex items-center gap-1.5 font-dm-sans text-xs text-ink-muted transition-colors hover:text-brand"
        >
          <span className="text-sm leading-none">+</span> Add note
        </button>
      )}
    </div>
  );
}
