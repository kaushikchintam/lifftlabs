"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAX_PRICE, MIN_PRICE, topicsFor } from "@/features/journeys/config";
import { btnPrimary, inputCls } from "@/components/ui/lifft";
import { JourneyTagPicker } from "./journey-tag-picker";


const label = "mb-2 block text-[15px] font-medium";

export function ApplicationForm() {
  const router = useRouter();
  const [f, setF] = useState({ fullName: "", email: "", roleTitle: "", linkedin: "", price: "50", credentials: "", livedExperience: "" });
  const [journeys, setJourneys] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const topics = topicsFor(journeys);
  const visibleTags = tags.filter((t) => topics.includes(t));

  const price = Number(f.price);
  const priceOk = Number.isInteger(price) && price >= MIN_PRICE && price <= MAX_PRICE;
  const complete =
    f.fullName && f.email && f.roleTitle && f.linkedin && priceOk && journeys.length && visibleTags.length && f.credentials && f.livedExperience;

  return (
    <form
      className="rounded-2xl border border-lf-line bg-white p-7"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/mentors/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...f, price, journeys, tags: visibleTags }),
        });
        setBusy(false);
        if (res.ok) router.push("/mentor/apply/done");
        else setError(res.status === 409 ? "There's already an application with that email." : "Something went wrong. Please try again.");
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label><span className={label}>Full name</span><input className={inputCls} value={f.fullName} onChange={set("fullName")} required /></label>
        <label><span className={label}>Role or title</span><input className={inputCls} value={f.roleTitle} onChange={set("roleTitle")} placeholder="e.g. GP, personal trainer" required /></label>
        <label><span className={label}>Email</span><input className={inputCls} type="email" value={f.email} onChange={set("email")} required /></label>
        <label><span className={label}>LinkedIn</span><input className={inputCls} value={f.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..." required /></label>
        <label>
          <span className={label}>Price per session (£)</span>
          <input className={inputCls} type="number" min={MIN_PRICE} max={MAX_PRICE} step={1} value={f.price} onChange={set("price")} required />
        </label>
      </div>

      <JourneyTagPicker journeys={journeys} tags={tags} onJourneys={setJourneys} onTags={setTags} />

      <label className="mt-6 block">
        <span className={label}>Credentials</span>
        <textarea className={inputCls} rows={2} value={f.credentials} onChange={set("credentials")} placeholder="Registration number, qualifications, insurance" required />
      </label>
      <label className="mt-5 block">
        <span className={label}>Your lived experience</span>
        <textarea className={inputCls} rows={3} value={f.livedExperience} onChange={set("livedExperience")} placeholder="What have you been through that a learner would recognise?" required />
      </label>

      {error && <p className="mt-4 text-[15px] text-[#B42318]">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button className={btnPrimary} disabled={!complete || busy}>
          Submit application
        </button>
      </div>
    </form>
  );
}
