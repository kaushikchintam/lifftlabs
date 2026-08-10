"use client";

import { useCallback, useState } from "react";
import { ChecklistHeader } from "./checklist-header";
import { ChecklistSection } from "./checklist-section";
import { TimelineViewCard } from "./timeline-view-card";

export interface Note {
  id: string;
  content: string;
  created_at: string;
}

export interface Step {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  checklist_notes: Note[];
}

export interface Section {
  id: string;
  title: string;
  checklist_steps: Step[];
}

export function ChecklistBoard({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // One flat refetch after any mutation, at any level of the tree — simplest
  // way to stay correct across a 3-level nested structure without hand
  // patching nested state per action.
  const refresh = useCallback(async () => {
    const res = await fetch("/api/checklist/sections");
    if (res.ok) {
      const { sections } = await res.json();
      setSections(sections);
    }
  }, []);

  async function addSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    setSaving(true);
    const res = await fetch("/api/checklist/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setSaving(false);
    if (res.ok) {
      setNewSectionTitle("");
      setAddingSection(false);
      await refresh();
    }
  }

  const totalSteps = sections.reduce((n, s) => n + s.checklist_steps.length, 0);
  const doneSteps = sections.reduce(
    (n, s) => n + s.checklist_steps.filter((step) => step.status === "done").length,
    0
  );

  return (
    <div className="space-y-6">
      <ChecklistHeader doneSteps={doneSteps} totalSteps={totalSteps} />

      <div className="grid items-start gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {sections.map((section) => (
            <ChecklistSection key={section.id} section={section} onChange={refresh} />
          ))}

          {addingSection ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#ECE7DD] bg-white p-4 shadow-sm">
              <input
                autoFocus
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSection();
                  if (e.key === "Escape") {
                    setAddingSection(false);
                    setNewSectionTitle("");
                  }
                }}
                placeholder="Section name…"
                className="flex-1 rounded-lg border border-[#ECE7DD] bg-white px-3 py-2 font-dm-sans text-sm text-ink outline-none focus:border-[#1A665A]"
              />
              <button
                onClick={addSection}
                disabled={saving}
                className="rounded-full bg-[#1A665A] px-4 py-2 font-dm-sans text-sm font-semibold text-white transition-colors hover:bg-[#15544A] disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingSection(false);
                  setNewSectionTitle("");
                }}
                className="font-dm-sans text-sm text-ink-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSection(true)}
              className="flex items-center gap-1.5 font-dm-sans text-sm text-ink-muted transition-colors hover:text-[#1A665A]"
            >
              <span className="text-base leading-none">+</span> Add a section
            </button>
          )}
        </div>

        <TimelineViewCard />
      </div>
    </div>
  );
}
