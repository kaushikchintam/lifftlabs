//the post-submission detail view
"use client";

import { useState } from "react";
import { EXPERIENCE_KIND_LABELS, type ExperienceKind } from "./data/experience-options";
import { PhotoUploader } from "./photo-uploader";
import { ReflectionBox } from "./reflection-box";

export interface Attachment {
  id: string;
  experience_id: string;
  file_name: string;
  kind: "photo" | "evidence";
  signedUrl: string;
}

export interface ExperienceLog {
  id: string;
  exp_type: ExperienceKind;
  custom_exp_type: string | null;
  activity_description: string | null;
  organisation: string;
  location_site: string;
  setting: "remote" | "in_person" | null;
  duration_note: string | null;
  supervisor: string | null;
  evidence_reference: string | null;
  is_recurring: boolean;
  start_date: string;
  end_date: string | null;
  total_hours: number | null;
  live_hours: number;
  reflection: string | null;
  attachments: Attachment[];
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { month: "short" });

function dateRange(log: ExperienceLog) {
  const start = dateFmt.format(new Date(log.start_date));
  if (!log.end_date) return log.is_recurring ? `${start} – ongoing` : start;
  const end = dateFmt.format(new Date(log.end_date));
  return start === end ? start : `${start}–${end}`;
}

export function ExperienceDetail({
  log,
  onChange,
}: {
  log: ExperienceLog;
  onChange: () => void | Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const hours = Math.round(Number(log.live_hours) || 0);
  const rising = log.is_recurring && !log.end_date;
  const typeLabel =
    log.exp_type === "other" ? log.custom_exp_type ?? "Other" : EXPERIENCE_KIND_LABELS[log.exp_type];

  const photos = log.attachments.filter((a) => a.kind === "photo");
  const evidence = log.attachments.filter((a) => a.kind === "evidence");

  async function deleteLog() {
    setDeleting(true);
    const res = await fetch(`/api/experience/${log.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) await onChange();
  }

  const metaLine = [log.organisation, log.location_site, dateRange(log), log.duration_note]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-none flex-col items-center justify-center rounded-xl bg-[#ECE7DD]">
            <span className="font-dm-serif text-lg leading-none text-ink">{hours}h</span>
            {rising && (
              <span className="mt-0.5 font-dm-sans text-[9px] font-semibold uppercase text-ink-faintest">
                &amp; rising
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-dm-sans text-base font-semibold text-ink">
                {log.activity_description || log.organisation}
              </h3>
              <span className="rounded-full bg-[#FAF8F3] px-3 py-1 font-dm-sans text-xs font-semibold text-ink-muted">
                {typeLabel}
              </span>
            </div>
            <p className="mt-1 font-dm-sans text-sm text-ink-muted">{metaLine}</p>
          </div>
        </div>

        <button
          onClick={deleteLog}
          disabled={deleting}
          className="flex-none font-dm-sans text-xs text-ink-faintest transition-colors hover:text-danger disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#ECE7DD] pt-4 sm:grid-cols-2">
        {log.supervisor && (
          <p className="font-dm-sans text-sm text-ink">
            <span className="font-semibold">Supervisor</span> — {log.supervisor}
          </p>
        )}
        {log.evidence_reference && (
          <p className="font-dm-sans text-sm text-ink">
            <span className="font-semibold">Evidence</span> — {log.evidence_reference}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PhotoUploader experienceId={log.id} kind="photo" attachments={photos} onChange={onChange} />
        <PhotoUploader experienceId={log.id} kind="evidence" attachments={evidence} onChange={onChange} />
      </div>

      <div className="mt-4 border-t border-[#ECE7DD] pt-4">
        <ReflectionBox experienceId={log.id} reflection={log.reflection} onChange={onChange} />
      </div>
    </div>
  );
}
