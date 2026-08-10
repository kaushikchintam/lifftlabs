"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ChecklistStep } from "./checklist-step";
import type { Section } from "./checklist-board";

/** One section card: inline-editable title (click to rename, Enter to save —
 *  no pencil), its steps, and the "+ Add a step" trigger. */
export function ChecklistSection({
  section,
  onChange,
}: {
  section: Section;
  onChange: () => void | Promise<void>;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [addingStep, setAddingStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [saving, setSaving] = useState(false);
  // Steps whose note composer should auto-open once they render — "Add a
  // step" chains straight into "Add a note" per the product decision.
  const [justCreatedStepId, setJustCreatedStepId] = useState<string | null>(null);

  const doneCount = section.checklist_steps.filter((s) => s.status === "done").length;

  async function saveTitle() {
    const trimmed = title.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === section.title) {
      setTitle(section.title);
      return;
    }
    const res = await fetch(`/api/checklist/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) await onChange();
    else setTitle(section.title);
  }

  async function deleteSection() {
    const res = await fetch(`/api/checklist/sections/${section.id}`, { method: "DELETE" });
    if (res.ok) await onChange();
  }

  async function addStep() {
    const trimmed = newStepTitle.trim();
    if (!trimmed) return;
    setSaving(true);
    const res = await fetch(`/api/checklist/sections/${section.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    setSaving(false);
    if (res.ok) {
      const { step } = await res.json();
      setNewStepTitle("");
      setAddingStep(false);
      setJustCreatedStepId(step.id);
      await onChange();
    }
  }

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#ECE7DD] px-6 py-4">
        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            onBlur={saveTitle}
            className="border-b border-[#1A665A] bg-transparent font-dm-serif text-xl text-ink outline-none"
          />
        ) : (
          <h2
            onClick={() => setEditingTitle(true)}
            className="cursor-text font-dm-serif text-xl text-ink"
          >
            {section.title}
          </h2>
        )}
        <div className="flex flex-none items-center gap-3">
          <span className="rounded-full bg-[#FAF8F3] px-3 py-1 font-dm-sans text-xs font-semibold text-ink-muted">
            {doneCount}/{section.checklist_steps.length} tasks
          </span>
          <button
            onClick={deleteSection}
            className="text-ink-faintest transition-colors hover:text-danger"
            aria-label="Delete section"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div>
        {section.checklist_steps.map((step) => (
          <ChecklistStep
            key={step.id}
            step={step}
            onChange={onChange}
            autoOpenNotes={step.id === justCreatedStepId}
          />
        ))}
      </div>

      <div className="px-6 py-4">
        {addingStep ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addStep();
                if (e.key === "Escape") {
                  setAddingStep(false);
                  setNewStepTitle("");
                }
              }}
              placeholder="Step name…"
              className="flex-1 rounded-lg border border-[#ECE7DD] bg-white px-3 py-2 font-dm-sans text-sm text-ink outline-none focus:border-[#1A665A]"
            />
            <button
              onClick={addStep}
              disabled={saving}
              className="rounded-full bg-[#1A665A] px-4 py-2 font-dm-sans text-sm font-semibold text-white transition-colors hover:bg-[#15544A] disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setAddingStep(false);
                setNewStepTitle("");
              }}
              className="font-dm-sans text-sm text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingStep(true)}
            className="flex items-center gap-1.5 font-dm-sans text-sm text-ink-muted transition-colors hover:text-[#1A665A]"
          >
            <span className="text-base leading-none">+</span> Add a step
          </button>
        )}
      </div>
    </div>
  );
}
