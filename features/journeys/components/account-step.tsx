"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { btnPrimary, inputCls } from "@/components/ui/lifft";
import type { Answers } from "@/features/journeys/config";

type Stage = "form" | "code" | "saving" | "failed";

/** The 6-digit email code. Also used by /verify for returning unverified users. */
export function CodeForm({ email, onVerified }: { email: string; onVerified: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code.trim() });
        setBusy(false);
        if (error) setError("That code didn't work. Check it, or send a new one.");
        else onVerified();
      }}
    >
      <p className="text-[17px] text-lf-body">
        We&apos;ve sent a 6-digit code to <strong>{email}</strong>.
      </p>
      <input
        className={inputCls}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123456"
        aria-label="Verification code"
      />
      {error && <p className="text-[15px] text-[#B42318]">{error}</p>}
      <div className="flex items-center gap-4">
        <button className={btnPrimary} disabled={busy || code.trim().length !== 6}>
          Verify <ArrowRight size={18} />
        </button>
        <button
          type="button"
          className="text-[15px] text-lf-muted underline"
          onClick={() => authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" })}
        >
          Send a new code
        </button>
      </div>
    </form>
  );
}

export function AccountStep({
  journey,
  answers,
  signedInEmail,
  loginHref,
}: {
  journey: string;
  answers: Answers;
  signedInEmail: string | null;
  loginHref: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(signedInEmail ? "code" : "form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(signedInEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setStage("saving");
    const res = await fetch("/api/intakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ journey, answers }),
    });
    if (res.ok) router.push("/dashboard");
    else setStage("failed");
  }

  if (stage !== "form") {
    return (
      <div className="rounded-2xl border border-lf-line bg-white p-8">
        {stage === "code" && <CodeForm email={email} onVerified={finish} />}
        {stage === "saving" && <p className="text-[17px] text-lf-body">Setting up your space…</p>}
        {stage === "failed" && (
          <div className="space-y-4">
            <p className="text-[15px] text-[#B42318]">We couldn&apos;t save your answers.</p>
            <button className={btnPrimary} onClick={finish}>Try again</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const { error } = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
        if (error) {
          setError(
            error.code === "USER_ALREADY_EXISTS" || error.status === 422
              ? "There's already an account with that email. Log in instead."
              : error.message ?? "Couldn't create your account."
          );
          return;
        }
        await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "email-verification" });
        setStage("code");
      }}
    >
      <div className="space-y-5 rounded-2xl border border-lf-line bg-white p-8">
        <label className="block">
          <span className="mb-2 block text-[17px] font-medium">First name</span>
          <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[17px] font-medium">Email</span>
          <input className={inputCls} required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[17px] font-medium">Password</span>
          <input
            className={inputCls}
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <div className="flex gap-3 rounded-xl bg-lf-soft px-5 py-4 text-[15px] text-lf-body">
          <Lock size={18} className="mt-0.5 flex-none text-lf-muted" />
          Mentors you book see your one-page profile first, so you don&apos;t spend the hour explaining yourself.
        </div>
        {error && <p className="text-[15px] text-[#B42318]">{error}</p>}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button className={btnPrimary}>
          Create account <ArrowRight size={18} />
        </button>
        <Link href={loginHref} className="text-[15px] text-lf-muted underline">
          Already have an account? Log in
        </Link>
      </div>
    </form>
  );
}
