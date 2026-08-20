"use client";

import { useCallback, useEffect, useState } from "react";
import { POT_CONFIGS, type FinanceStage } from "./data/pot-configs";

export function PotCard({
  stage,
  onTotalChange,
}: {
  stage: FinanceStage;
  onTotalChange?: (totalPence: number) => void;
}) {
  const config = POT_CONFIGS[stage];
  const [totalPence, setTotalPence] = useState(0);
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/finances/pot");
    if (res.ok) {
      const { totalPence } = await res.json();
      setTotalPence(totalPence);
      onTotalChange?.(totalPence);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd() {
    const pounds = Number(amount);
    if (!pounds || pounds <= 0) return;
    setSaving(true);
    const res = await fetch("/api/finances/pot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPence: Math.round(pounds * 100) }),
    });
    setSaving(false);
    if (res.ok) {
      setAmount("");
      refresh();
    }
  }

  const pct = Math.min(100, Math.round((totalPence / config.goalPence) * 100));

  return (
    <div className="rounded-2xl bg-brand px-6 py-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-dm-sans text-xs font-bold uppercase tracking-wide text-white/80">{config.potName}</p>
        <p className="font-dm-serif text-3xl">
          £{(totalPence / 100).toLocaleString()}{" "}
          <span className="font-dm-sans text-sm text-white/80">of £{(config.goalPence / 100).toLocaleString()} goal</span>
        </p>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/30">
        <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="font-dm-sans text-sm text-white/80">{pct}% funded</p>
        <div className="flex items-center gap-2">
          <input
            className="w-24 rounded-full px-3 py-1.5 font-dm-sans text-sm text-ink focus:outline-none"
            placeholder="£"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="rounded-full bg-white px-4 py-1.5 font-dm-sans text-sm font-semibold text-brand hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            + Add to pot
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/20 pt-4">
        {config.targetCosts.map((cost) => (
          <div key={cost.label}>
            <p className="font-dm-sans text-sm text-white/80">{cost.label}</p>
            <p className="font-dm-sans font-semibold">{cost.amountRange}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 font-dm-sans text-xs text-white/70">{config.note}</p>
    </div>
  );
}
