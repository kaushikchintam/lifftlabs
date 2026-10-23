"use client";

import { useState } from "react";
import { btnPrimary, inputCls } from "@/components/ui/lifft";

/** Approved mentors land here from the magic link: set a password, then the stepper takes over. */
export default function MentorOnboardingPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="min-h-screen bg-lf-page px-4 py-16 text-lf-ink">
      <div className="mx-auto max-w-[560px]">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">You&apos;re approved</h1>
        <p className="mb-8 text-lg text-lf-body">
          Set a password so you can log back in. Next you&apos;ll add your weekly hours.
        </p>
        <form
          className="space-y-5 rounded-2xl border border-lf-line bg-white p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            const res = await fetch("/api/onboarding/mentor", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password }),
            });
            setBusy(false);
            if (res.ok) window.location.href = "/dashboard";
            else setError(res.status === 403 ? "We couldn't find an approved application for this email." : "Something went wrong.");
          }}
        >
          <label className="block">
            <span className="mb-2 block text-[15px] font-medium">Password</span>
            <input className={inputCls} type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[15px] font-medium">Confirm password</span>
            <input className={inputCls} type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </label>
          {error && <p className="text-[15px] text-[#B42318]">{error}</p>}
          <button className={btnPrimary} disabled={busy || password.length < 8 || password !== confirm}>
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
