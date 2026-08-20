"use client";

import { useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import type { Attachment } from "./experience-detail";

const MAX_PER_KIND = 4;

const KIND_COPY: Record<"photo" | "evidence", { label: string; accept: string; addLabel: string }> = {
  photo: { label: "Photos", accept: "image/jpeg,image/png,image/webp", addLabel: "Add photos" },
  evidence: { label: "Evidence", accept: "image/jpeg,image/png,image/webp,application/pdf", addLabel: "Add evidence" },
};

export function PhotoUploader({
  experienceId,
  kind,
  attachments,
  onChange,
}: {
  experienceId: string;
  kind: "photo" | "evidence";
  attachments: Attachment[];
  onChange: () => void | Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const copy = KIND_COPY[kind];

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);
    const res = await fetch(`/api/experience/${experienceId}/attachments`, {
      method: "POST",
      body: form,
    });
    setUploading(false);
    if (res.ok) {
      await onChange();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(
        body.error === "too_large"
          ? "File too large — 10 MB max."
          : body.error === `${kind}_cap_reached`
            ? `Up to ${MAX_PER_KIND} ${copy.label.toLowerCase()}.`
            : body.error === "unsupported_type"
              ? "Unsupported file type."
              : "Upload failed — try again."
      );
    }
  }

  async function remove(attachment: Attachment) {
    await fetch(`/api/experience/${experienceId}/attachments/${attachment.id}`, { method: "DELETE" });
    if (viewing?.id === attachment.id) setViewing(null);
    await onChange();
  }

  const isImage = (a: Attachment) => a.file_name.match(/\.(jpe?g|png|webp)$/i);

  return (
    <div>
      <p className="mb-1.5 font-dm-sans text-xs font-bold uppercase tracking-wide text-ink-muted">{copy.label}</p>

      <div className="flex flex-wrap gap-2">
        {attachments.map((a) =>
          isImage(a) ? (
            <button key={a.id} type="button" onClick={() => setViewing(a)} className="group relative h-16 w-16 flex-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.signedUrl}
                alt={a.file_name}
                className="h-16 w-16 rounded-lg border border-[#ECE7DD] object-cover"
              />
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  remove(a);
                }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={11} />
              </span>
            </button>
          ) : (
            <span
              key={a.id}
              className="flex items-center gap-1.5 rounded-full border border-[#ECE7DD] bg-white px-3 py-1.5 font-dm-sans text-xs text-ink-muted"
            >
              <a href={a.signedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-ink">
                <FileText size={13} /> {a.file_name}
              </a>
              <button type="button" onClick={() => remove(a)} className="text-ink-faintest hover:text-danger">
                <X size={12} />
              </button>
            </span>
          )
        )}
      </div>

      {attachments.length < MAX_PER_KIND && (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex items-center gap-1.5 font-dm-sans text-xs text-ink-muted transition-colors hover:text-brand disabled:opacity-50"
        >
          <span className="text-sm leading-none">+</span> {uploading ? "Uploading…" : copy.addLabel}
        </button>
      )}

      {error && <p className="mt-1 font-dm-sans text-xs text-danger">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept={copy.accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setViewing(null)}
        >
          <div className="relative max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewing.signedUrl} alt={viewing.file_name} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                onClick={() => remove(viewing)}
                className="rounded-full bg-white/90 px-3 py-1.5 font-dm-sans text-xs font-semibold text-danger hover:bg-white transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => setViewing(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
