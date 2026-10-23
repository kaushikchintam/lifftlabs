"use client";

import { useState } from "react";
import { btnPrimary, inputCls } from "@/components/ui/lifft";
import type { Answers } from "@/features/journeys/config";

export function WaitlistForm({
  journey,
  answers,
  defaultEmail,
}: {
  journey: string;
  answers: Answers;
  defaultEmail: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  if (state === "done") {
    return (
      <div className="max-w-[760px] rounded-2xl border border-lf-line bg-white p-8 text-[17px]">
        You&apos;re on the list. We&apos;ll email <strong>{email}</strong> as soon as a mentor is ready.
      </div>
    );
  }

  return (
    <form
      className="max-w-[760px] rounded-2xl border border-lf-line bg-white p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, journey, answers }),
        });
        setState(res.ok ? "done" : "error");
      }}
    >
      <label className="block">
        <span className="mb-2 block text-[17px] font-medium">Email</span>
        <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {state === "error" && <p className="mt-3 text-[15px] text-[#B42318]">Something went wrong. Please try again.</p>}
      <button className={`${btnPrimary} mt-5`} disabled={state === "busy"}>
        Join the waitlist
      </button>
    </form>
  );
}
