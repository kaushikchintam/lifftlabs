"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/bloom-field-gradient";

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    if (res.ok) {
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } else {
      setLoading(false);
      setError("Couldn't start checkout — try again in a moment.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute inset-0">
        <GradientBackground className="h-full w-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-4 font-sligoil text-xs font-bold uppercase tracking-widest text-brand">
          LIFFT Labs
        </span>
        <h1 className="font-dm-serif text-5xl text-ink mb-4">Everything, one plan</h1>
        <p className="max-w-md font-sligoil text-base text-ink-muted mb-8">
          Mentors, video sessions, your evidence, your portfolio, your whole route through medicine,
          one subscription, cancel any time.
        </p>
        <p className="font-dm-serif text-4xl text-ink mb-1">
          £11.99<span className="font-sligoil text-base text-ink-muted"> / month</span>
        </p>
        <p className="mb-8 font-sligoil text-xs text-ink-faintest">
          Have a code? You&rsquo;ll get the chance to enter it at checkout.
        </p>
        <button
          onClick={() => router.push("/signup/learner")}
          disabled={loading}
          className="rounded-full bg-brand px-8 py-3 font-sligoil text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Subscribe"}
        </button>
        {error && <p className="mt-4 font-sligoil text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
