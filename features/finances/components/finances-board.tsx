"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
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
  const [monthlyPartTimeIncomePence, setMonthlyPartTimeIncomePence] = useState(0);

  const [editingSetAside, setEditingSetAside] = useState(false);
  const [setAsideInput, setSetAsideInput] = useState("");
  const [savingSetAside, setSavingSetAside] = useState(false);

  const refreshSetAside = useCallback(async () => {
    const res = await fetch("/api/finances/set-aside");
    if (res.ok) {
      const { setAsidePence } = await res.json();
      setSetAsidePence(setAsidePence);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    const [incomeRes, outgoingsRes] = await Promise.all([
      fetch("/api/finances/income"),
      fetch("/api/finances/outgoings"),
    ]);

    if (incomeRes.ok) {
      const { sources } = await incomeRes.json();
      const monthlySources = sources.filter((s: { cadence: string }) => s.cadence === "monthly");
      const monthlyIncomePence = monthlySources.reduce((sum: number, s: { amount_pence: number }) => sum + s.amount_pence, 0);
      const partTimePence = monthlySources
        .filter((s: { is_part_time: boolean }) => s.is_part_time)
        .reduce((sum: number, s: { amount_pence: number }) => sum + s.amount_pence, 0);
      setMonthlyPartTimeIncomePence(partTimePence);

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
    refreshSetAside();
    refreshStats();
  }, [refreshSetAside, refreshStats]);

  async function handleSaveSetAside() {
    const pounds = Number(setAsideInput);
    if (Number.isNaN(pounds) || pounds < 0) return;
    setSavingSetAside(true);
    const res = await fetch("/api/finances/set-aside", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setAsidePence: Math.round(pounds * 100) }),
    });
    setSavingSetAside(false);
    if (res.ok) {
      setSetAsidePence(Math.round(pounds * 100));
      setEditingSetAside(false);
    }
  }

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
          <div className="flex items-center gap-1.5">
            <p className="font-dm-sans text-sm text-ink-muted">Set aside</p>
            <button
              onClick={() => {
                setSetAsideInput(String(setAsidePence / 100));
                setEditingSetAside(true);
              }}
              title="Edit set aside amount"
              className="text-ink-faintest hover:text-ink transition-colors"
            >
              <Pencil size={12} />
            </button>
          </div>
          {editingSetAside ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="font-dm-sans text-sm text-ink-muted">£</span>
              <input
                autoFocus
                className="w-24 rounded-lg border border-[#D8D2C2] px-2 py-1 font-dm-sans text-sm"
                value={setAsideInput}
                onChange={(e) => setSetAsideInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveSetAside()}
              />
              <button
                onClick={handleSaveSetAside}
                disabled={savingSetAside}
                className="font-dm-sans text-sm text-brand hover:underline disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setEditingSetAside(false)}
                className="font-dm-sans text-sm text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1 font-dm-serif text-4xl text-ink">£{(setAsidePence / 100 / 1000).toFixed(1)}k</p>
          )}
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
        <ScenariosCard
          totalFundPence={totalFundPence}
          monthlyShortfallPence={monthlyShortfallPence}
          monthlyPartTimeIncomePence={monthlyPartTimeIncomePence}
        />
      </div>

      <IncomeOutgoingsPanel stage={stage} />

      <DiscountsPanel stage={stage} />
    </div>
  );
}
