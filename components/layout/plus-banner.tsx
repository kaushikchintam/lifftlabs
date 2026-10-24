"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { btnPrimary, btnSecondary } from "@/components/ui/lifft";
import { PLUS_DISCOUNT_PERCENT, PLUS_MONTHLY_PENCE } from "@/features/journeys/config";
import { formatPence } from "@/utils/format-date";

const FEEDBACK_URL = "https://tally.so/r/Yj56P5";

/** Top of every Plus tool: Subscribe (Stripe Checkout) or, for members, Manage (Billing Portal). */
export function PlusBanner({ member }: { member: boolean }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const res = await fetch(member ? "/api/billing/portal" : "/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnTo: pathname }),
    });
    const data = await res.json().catch(() => ({}));
    const url = data.checkoutUrl ?? data.url;
    if (url) window.location.assign(url);
    else setBusy(false);
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-lf-line bg-white px-6 py-4">
      <span className="rounded-full bg-[#DDF3E6] px-3 py-1 text-[13px] font-semibold tracking-wide text-[#1F7A4C]">LIFFT PLUS</span>
      <p className="min-w-0 flex-1 text-[15px] text-lf-body">
        {member
          ? `You're on LIFFT Plus, with ${PLUS_DISCOUNT_PERCENT}% off every session.`
          : "Experience log, Portfolio, Reflection and Resources are part of the LIFFT Plus subscription."}
      </p>
      {!member && <span className="text-[15px] font-semibold">{formatPence(PLUS_MONTHLY_PENCE)} / month</span>}
      {member && (
        // ponytail: beta feedback form (refund on completion, done by hand in Stripe)
        <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          Give feedback
        </a>
      )}
      <button className={member ? btnSecondary : btnPrimary} disabled={busy} onClick={go}>
        {busy ? "Opening…" : member ? "Manage" : "Subscribe"}
      </button>
    </div>
  );
}
