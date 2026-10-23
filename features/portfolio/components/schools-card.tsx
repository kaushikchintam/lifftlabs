"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { btnPrimary, inputCls } from "@/components/ui/lifft";
import { SCHOOL_STAGES, type SchoolStage } from "./data/portfolio-options";

export interface School {
  id: string;
  school: string;
  stage: SchoolStage;
}

async function call(method: string, body: object) {
  await fetch("/api/med-schools", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

export function SchoolsCard({ schools, onChange }: { schools: School[]; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="rounded-2xl border border-lf-line bg-white p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[21px] font-medium">Medical school applications</h2>
          <p className="text-[15px] text-lf-muted">Track each UCAS choice against its stage — your portfolio evidence sits underneath.</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-[15px] font-medium underline">
            + Add a school
          </button>
        )}
      </div>

      {adding && (
        <form
          className="mt-4 flex flex-wrap gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim()) return;
            await call("POST", { school: name.trim() });
            setName("");
            setAdding(false);
            onChange();
          }}
        >
          <input autoFocus className={`${inputCls} max-w-sm`} placeholder="e.g. King's College London" value={name} onChange={(e) => setName(e.target.value)} />
          <button className={btnPrimary}>Add</button>
          <button type="button" className="text-[15px] text-lf-muted" onClick={() => setAdding(false)}>Cancel</button>
        </form>
      )}

      {schools.length === 0 ? (
        !adding && <p className="mt-4 text-[15px] text-lf-muted">No schools added yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-lf-line">
          {schools.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <span className="text-[17px]">{s.school}</span>
              <div className="flex items-center gap-3">
                <select
                  aria-label={`Stage for ${s.school}`}
                  className="rounded-xl border border-lf-line-strong bg-white px-3 py-2 text-[15px]"
                  value={s.stage}
                  onChange={async (e) => {
                    await call("PATCH", { id: s.id, stage: e.target.value });
                    onChange();
                  }}
                >
                  {SCHOOL_STAGES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
                <button
                  aria-label={`Remove ${s.school}`}
                  className="text-lf-muted hover:text-lf-ink"
                  onClick={async () => {
                    await call("DELETE", { id: s.id });
                    onChange();
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
