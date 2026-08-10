"use client";

import { useState } from "react";
import { Check, Minus, Trash2 } from "lucide-react";
import { StepNotes } from "./step-notes";
import type { Step } from "./checklist-board";

const STATUS_ORDER: Step["status"][] = ["todo", "in_progress", "done"];

/** One step row: tri-state checkbox (click cycles todo → in_progress → done),
 *  inline-editable title, delete, and its notes underneath. */
export function ChecklistStep({
  step,
  onChange,
  autoOpenNotes,
}: {
  step: Step;
  onChange: () => void | Promise<void>;
  autoOpenNotes?: boolean;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(step.title);

  async function saveTitle() {
    const trimmed = title.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === step.title) {
      setTitle(step.title);
      return;
    }
    const res = await fetch(`/api/checklist/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (res.ok) await onChange();
    else setTitle(step.title);
  }

  async function cycleStatus() {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(step.status) + 1) % STATUS_ORDER.length];
    const res = await fetch(`/api/checklist/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) await onChange();
  }

  async function deleteStep() {
    const res = await fetch(`/api/checklist/steps/${step.id}`, { method: "DELETE" });
    if (res.ok) await onChange();
  }

  return (
    <div className="border-b border-[#ECE7DD] px-6 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <button
          onClick={cycleStatus}
          className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 transition-colors ${
            step.status === "done"
              ? "border-[#1A665A] bg-[#1A665A]"
              : step.status === "in_progress"
                ? "border-warning bg-white"
                : "border-[#D8D2C4] bg-white"
          }`}
          aria-label={`Status: ${step.status}`}
        >
          {step.status === "done" && <Check size={13} className="text-white" strokeWidth={3} />}
          {step.status === "in_progress" && (
            <Minus size={13} className="text-warning" strokeWidth={3} />
          )}
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveTitle()}
            onBlur={saveTitle}
            className="flex-1 border-b border-[#1A665A] bg-transparent font-dm-sans text-sm font-semibold text-ink outline-none"
          />
        ) : (
          <p
            onClick={() => setEditingTitle(true)}
            className={`flex-1 cursor-text font-dm-sans text-sm font-semibold ${
              step.status === "done" ? "text-ink-muted line-through" : "text-ink"
            }`}
          >
            {step.title}
          </p>
        )}

        {step.status === "in_progress" && (
          <span className="flex-none rounded-full bg-[#FEF3C7] px-2.5 py-0.5 font-dm-sans text-[11px] font-semibold text-[#92400E]">
            In progress
          </span>
        )}

        <button
          onClick={deleteStep}
          className="flex-none text-ink-faintest transition-colors hover:text-danger"
          aria-label="Delete step"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-2 pl-8">
        <StepNotes step={step} onChange={onChange} autoOpen={autoOpenNotes} />
      </div>
    </div>
  );
}
