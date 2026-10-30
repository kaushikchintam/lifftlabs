"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, btnSecondary } from "@/components/ui/lifft";

const ERRORS: Record<string, string> = {
  too_large: "That photo is over 5 MB.",
  unsupported_type: "Use a JPG, PNG or WebP.",
};

export function PhotoPicker({ name, id, image }: { name: string; id: string; image: string | null }) {
  const router = useRouter();
  const [src, setSrc] = useState(image);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/mentor/photo", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(ERRORS[data.error] ?? "Couldn't upload. Try again.");
    setSrc(data.image);
    router.refresh();
  }

  return (
    <div className="mb-6 flex max-w-4xl items-center gap-5 rounded-2xl border border-lf-line bg-white p-7">
      <Avatar name={name} id={id} src={src} size={88} />
      <div>
        <p className="mb-1 text-[17px] font-medium">Profile photo</p>
        <p className="mb-3 text-[14px] text-lf-muted">Learners see this on your match card. JPG, PNG or WebP, up to 5 MB.</p>
        <label className={`${btnSecondary} cursor-pointer`}>
          {busy ? "Uploading…" : src ? "Change photo" : "Add photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
        {error && <p className="mt-2 text-[14px] text-[#B42318]">{error}</p>}
      </div>
    </div>
  );
}
