"use client";

import { useCallback, useEffect, useState } from "react";
import { PotCard } from "./pot-card";
import { FundingSchemesCard } from "./funding-schemes-card";
import { TransitionCostsChecklist } from "./transition-costs-checklist";
import { ScenariosCard } from "./scenarios-card";
import { IncomeOutgoingsPanel } from "./income-outgoings-panel";
import { DiscountsPanel } from "./discounts-panel";
import type { FinanceStage } from "./data/pot-configs";

// Glue component — nothing in the original file list owned "fetch income
// and outgoings, derive the three stat cards, wire the pot total in."
// Same role as portfolio-board.tsx played for Portfolio.

export function FinancesBoard({ stage }: { stage: FinanceStage }) {
  const [potTotalPence, setPotTotalPence] = useState(0);
  const [setAsidePence, setSetAsidePence] = useState(0);
  const [monthlyShortfallPence, setMonthlyShortfallPence] = useState(0);

  const refreshStats = useCallback(async () => {
    const [incomeRes, outgoingsRes] = await Promise.all([
      fetch("/api/finances/income"),
      fetch("/api/finances/outgoings"),
    ]);

    if (incomeRes.ok) {
      const { sources } = await incomeRes.json();
      const savings = sources.find((s: { label: string }) => s.label.toLowerCase() === "savings");
      setSetAsidePence(savings?.amount_pence ?? 0);

      const monthlyIncomePence = sources
        .filter((s: { cadence: string }) => s.cadence === "monthly")
        .reduce((sum: number, s: { amount_pence: number }) => sum + s.amount_pence, 0);

      if (outgoingsRes.ok) {
        const { outgoings } = await outgoingsRes.json();
        const monthlyOutgoingsPence = outgoings
          .filter((o: { cadence: string }) => o.cadence === "monthly")
          .reduce((sum: number, o: { amount_pence: number }) => sum + o.amount_pence, 0);
        setMonthlyShortfallPence(Math.max(0, monthlyOutgoingsPence - monthlyIncomePence));
      }
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const totalFundPence = setAsidePence + potTotalPence;

  return (
    <div className="space-y-6">
      <PotCard stage={stage} onTotalChange={setPotTotalPence} />

      <FundingSchemesCard stage={stage} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-brand-tint/40 border border-brand-tint p-5">
          <p className="font-dm-sans text-sm text-ink-muted">Runway</p>
          <p className="mt-1 font-dm-serif text-4xl text-ink">
            {monthlyShortfallPence > 0 ? Math.floor(totalFundPence / monthlyShortfallPence) : "—"} mo
          </p>
          <p className="mt-1 font-dm-sans text-xs text-ink-muted">
            Total fund £{(totalFundPence / 100).toLocaleString()} ÷ £{(monthlyShortfallPence / 100).toLocaleString()}/mo shortfall
          </p>
        </div>
        <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
          <p className="font-dm-sans text-sm text-ink-muted">Set aside</p>
          <p className="mt-1 font-dm-serif text-4xl text-ink">£{(setAsidePence / 100 / 1000).toFixed(1)}k</p>
          <p className="mt-1 font-dm-sans text-xs text-ink-muted">Transition fund</p>
        </div>
        <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
          <p className="font-dm-sans text-sm text-ink-muted">Monthly shortfall</p>
          <p className="mt-1 font-dm-serif text-4xl text-ink">£{(monthlyShortfallPence / 100).toLocaleString()}</p>
          <p className="mt-1 font-dm-sans text-xs text-ink-muted">Derived from monthly income vs. outgoings below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TransitionCostsChecklist />
        <ScenariosCard totalFundPence={totalFundPence} monthlyShortfallPence={monthlyShortfallPence} />
      </div>

      <IncomeOutgoingsPanel stage={stage} />

      <DiscountsPanel stage={stage} />
    </div>
  );
}
