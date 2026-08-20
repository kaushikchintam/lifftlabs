"use client";

import { useState } from "react";
import Link from "next/link";

interface PaymentRow {
  id: string;
  amount_pence: number;
  created_at: string;
  session_id: string | null;
  mentor_name: string | null;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function PaymentsTab({
  role,
  hasStripeAccount,
  payments,
}: {
  role: "mentor" | "learner";
  hasStripeAccount: boolean;
  payments: PaymentRow[];
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
    <div className="rounded-2xl border border-[#ECE7DD] bg-white shadow-sm">
      <p className="px-6 pt-6 font-dm-sans font-semibold text-ink">Payment history</p>
      {payments.length === 0 ? (
        <p className="px-6 pb-6 pt-2 font-dm-sans text-sm text-ink-muted">
          No payments yet — they'll appear here after your first booking.
        </p>
      ) : (
        <div className="px-6 pb-6 pt-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-t border-[#ECE7DD] py-3 first:border-t-0">
              <div>
                <p className="font-dm-sans text-sm font-semibold text-ink">
                  Session{p.mentor_name ? ` with ${p.mentor_name}` : ""}
                </p>
                <p className="font-dm-sans text-sm text-ink-muted mt-0.5">
                  Paid {dateFmt.format(new Date(p.created_at))}
                  {p.session_id && (
                    <>
                      {" · "}
                      <Link href={`/sessions/${p.session_id}`} className="text-brand hover:underline underline-offset-2">
                        view session
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <p className="font-dm-sans font-semibold text-ink">£{(p.amount_pence / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
