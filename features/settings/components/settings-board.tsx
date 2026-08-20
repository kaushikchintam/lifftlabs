"use client";

import { useState } from "react";
import { User, CreditCard } from "lucide-react";
import { SettingsForm } from "./settings-form";
import { StageSection } from "./stage-section";
import { PaymentsTab } from "./payments-tab";

type Stage = "applicant" | "med_student" | "resident";

interface PaymentRow {
  id: string;
  amount_pence: number;
  created_at: string;
  session_id: string | null;
  mentor_name: string | null;
}

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "payments", label: "Payments", icon: CreditCard },
] as const;

export function SettingsBoard({
  role,
  hasStripeAccount,
  currentStage,
  payments,
}: {
  role: "mentor" | "learner";
  hasStripeAccount: boolean;
  currentStage: Stage | null;
  payments: PaymentRow[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("account");

  const activeLabel = TABS.find((t) => t.id === tab)!.label;

  return (
    <div>
      <span className="mb-4 inline-flex items-center rounded-full bg-[#F1ECE0] px-3 py-1 font-dm-sans text-xs font-semibold text-ink-muted">
        {activeLabel}
      </span>
      <div className="flex items-center gap-6 border-b border-[#ECE7DD]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 border-b-2 pb-3 font-dm-sans text-sm font-semibold transition-colors ${
                active ? "border-brand text-brand" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "account" ? (
          <div className="space-y-6">
            {role === "learner" && (
              <div className="rounded-2xl border border-[#ECE7DD] bg-white shadow-sm">
                <StageSection currentStage={currentStage ?? "applicant"} />
              </div>
            )}
            <SettingsForm />
          </div>
        ) : (
          <PaymentsTab role={role} hasStripeAccount={hasStripeAccount} payments={payments} />
        )}
      </div>
    </div>
  );
}
