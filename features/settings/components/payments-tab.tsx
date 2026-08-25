"use client";

import { useState } from "react";

interface SubscriptionInfo {
  status: string | null;
  currentPeriodEnd: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Active (trial)",
  canceling: "Canceling at end of period",
  canceled: "Canceled",
  past_due: "Payment failed — update your card",
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function PaymentsTab({
  role,
  hasStripeAccount,
  subscription,
}: {
  role: "mentor" | "learner";
  hasStripeAccount: boolean;
  subscription: SubscriptionInfo;
}) {
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  async function managePayouts() {
    setOpening(true);
    setError(null);
    const res = await fetch("/api/mentor/stripe/manage", { method: "POST" });
    setOpening(false);
    if (res.ok) {
      const { url } = await res.json();
      window.open(url, "_blank", "noopener");
    } else {
      setError("Couldn't open Stripe — try again in a moment.");
    }
  }

  async function manageBilling() {
    setOpening(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    setOpening(false);
    if (res.ok) {
      const { url } = await res.json();
      window.open(url, "_blank", "noopener");
    } else {
      setError("Couldn't open billing — try again in a moment.");
    }
  }

  if (role === "mentor") {
    return (
      <div className="rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
        <p className="font-dm-sans font-semibold text-ink mb-1">Payouts</p>
        <p className="font-dm-sans text-sm text-ink-muted mb-4">
          Payout history and bank details live in your Stripe dashboard — LIFFT never sees your bank
          information.
        </p>
        {hasStripeAccount ? (
          <button
            onClick={managePayouts}
            disabled={opening}
            className="rounded-full border border-[#ECE7DD] px-4 py-2 font-dm-sans text-sm text-ink transition-colors hover:bg-[#FAF8F3] disabled:opacity-50"
          >
            {opening ? "Opening…" : "Manage payouts in Stripe"}
          </button>
        ) : (
          <p className="font-dm-sans text-sm text-ink-muted">
            Finish Stripe onboarding to unlock payouts.
          </p>
        )}
        {error && <p className="mt-3 font-dm-sans text-sm text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
      <p className="font-dm-sans font-semibold text-ink mb-1">Subscription</p>
      {subscription.status ? (
        <>
          <p className="font-dm-sans text-sm text-ink-muted mb-1">
            {STATUS_LABEL[subscription.status] ?? subscription.status}
          </p>
          {subscription.currentPeriodEnd && (
            <p className="font-dm-sans text-sm text-ink-muted mb-4">
              {subscription.status === "canceling" ? "Access until" : "Renews"}{" "}
              {dateFmt.format(new Date(subscription.currentPeriodEnd))}
            </p>
          )}
          <button
            onClick={manageBilling}
            disabled={opening}
            className="rounded-full border border-[#ECE7DD] px-4 py-2 font-dm-sans text-sm text-ink transition-colors hover:bg-[#FAF8F3] disabled:opacity-50"
          >
            {opening ? "Opening…" : "Manage billing"}
          </button>
        </>
      ) : (
        <p className="font-dm-sans text-sm text-ink-muted mb-4">You&rsquo;re not subscribed yet.</p>
      )}
      {error && <p className="mt-3 font-dm-sans text-sm text-danger">{error}</p>}
    </div>
  );
}
