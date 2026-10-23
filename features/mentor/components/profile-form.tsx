"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_PRICE, MIN_PRICE, PLATFORM_FEE_PERCENT, topicsFor } from "@/features/journeys/config";
import { btnPrimary, inputCls } from "@/components/ui/lifft";
import { formatPence } from "@/utils/format-date";
import { JourneyTagPicker } from "./journey-tag-picker";

const label = "mb-2 block text-[15px] font-medium";

export interface ProfileValues {
  headline: string;
  bio: string;
  credentials: string;
  price: string;
  journeys: string[];
  tags: string[];
}

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const set = (k: "headline" | "bio" | "credentials" | "price") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const tags = f.tags.filter((t) => topicsFor(f.journeys).includes(t));
  const price = Number(f.price);
  const priceOk = Number.isInteger(price) && price >= MIN_PRICE && price <= MAX_PRICE;
  const complete = f.headline.trim() && f.bio.trim() && f.credentials.trim() && priceOk && f.journeys.length && tags.length;

  return (
    <form
      className="max-w-4xl rounded-2xl border border-lf-line bg-white p-7"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        const res = await fetch("/api/mentor/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...f, price, tags }),
        });
        setState(res.ok ? "saved" : "error");
        if (res.ok) router.refresh();
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className={label}>Headline</span><input className={inputCls} value={f.headline} onChange={set("headline")} placeholder="e.g. GP, personal trainer" required /></label>
        <label>
          <span className={label}>Price per session (£)</span>
          <input className={inputCls} type="number" min={MIN_PRICE} max={MAX_PRICE} step={1} value={f.price} onChange={set("price")} required />
        </label>
      </div>

      <JourneyTagPicker
        journeys={f.journeys}
        tags={tags}
        onJourneys={(journeys) => setF((p) => ({ ...p, journeys }))}
        onTags={(t) => setF((p) => ({ ...p, tags: t }))}
      />

      <label className="mt-6 block">
        <span className={label}>About you</span>
        <textarea className={inputCls} rows={4} value={f.bio} onChange={set("bio")} placeholder="What have you been through that a learner would recognise?" required />
      </label>
      <label className="mt-5 block">
        <span className={label}>Credentials</span>
        <textarea className={inputCls} rows={2} value={f.credentials} onChange={set("credentials")} placeholder="Registration number, qualifications, insurance" required />
      </label>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-[14px] text-lf-muted">
          You receive {priceOk ? formatPence(Math.round(price * 100 * (1 - PLATFORM_FEE_PERCENT / 100))) : "—"} per session. Sessions already booked keep their price.
        </p>
        <div className="flex items-center gap-4">
          {state === "saved" && <span className="text-[15px] text-[#1F7A4C]">Saved</span>}
          {state === "error" && <span className="text-[15px] text-[#B42318]">Couldn&apos;t save. Try again.</span>}
          <button className={btnPrimary} disabled={!complete || state === "saving"}>
            {state === "saving" ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
