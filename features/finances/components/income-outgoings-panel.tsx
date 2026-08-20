"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { OUTGOINGS_COPY } from "./data/outgoings-copy";
import type { FinanceStage } from "./data/pot-configs";

interface Row {
  id: string;
  label: string;
  amount_pence: number;
  cadence: "monthly" | "yearly";
  description: string | null;
}
interface IncomeRow extends Row {
  status_tag: string | null;
}
interface OutgoingRow extends Row {
  tag: string | null;
}

function QuickAddRow({ onAdd }: { onAdd: (label: string, pounds: number, cadence: "monthly" | "yearly") => void }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input className="flex-1 rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm" placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <input className="w-24 rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm" placeholder="£" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select className="rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm" value={cadence} onChange={(e) => setCadence(e.target.value as "monthly" | "yearly")}>
        <option value="monthly">/mo</option>
        <option value="yearly">/yr</option>
      </select>
      <button
        onClick={() => {
          const pounds = Number(amount);
          if (!label.trim() || !pounds) return;
          onAdd(label, pounds, cadence);
          setLabel("");
          setAmount("");
        }}
        className="font-dm-sans text-sm text-brand hover:underline"
      >
        + Add
      </button>
    </div>
  );
}

export function IncomeOutgoingsPanel({ stage }: { stage: FinanceStage }) {
  const [income, setIncome] = useState<IncomeRow[]>([]);
  const [outgoings, setOutgoings] = useState<OutgoingRow[]>([]);
  const copy = OUTGOINGS_COPY[stage];

  const refreshIncome = useCallback(async () => {
    const res = await fetch("/api/finances/income");
    if (res.ok) setIncome((await res.json()).sources);
  }, []);
  const refreshOutgoings = useCallback(async () => {
    const res = await fetch("/api/finances/outgoings");
    if (res.ok) setOutgoings((await res.json()).outgoings);
  }, []);

  useEffect(() => {
    refreshIncome();
    refreshOutgoings();
  }, [refreshIncome, refreshOutgoings]);

  async function addIncome(label: string, pounds: number, cadence: "monthly" | "yearly") {
    await fetch("/api/finances/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, amountPence: Math.round(pounds * 100), cadence }),
    });
    refreshIncome();
  }
  async function removeIncome(id: string) {
    await fetch(`/api/finances/income?id=${id}`, { method: "DELETE" });
    refreshIncome();
  }

  async function addOutgoing(label: string, pounds: number, cadence: "monthly" | "yearly") {
    await fetch("/api/finances/outgoings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, amountPence: Math.round(pounds * 100), cadence }),
    });
    refreshOutgoings();
  }
  async function removeOutgoing(id: string) {
    await fetch(`/api/finances/outgoings?id=${id}`, { method: "DELETE" });
    refreshOutgoings();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
        <h4 className="font-dm-sans font-semibold text-ink">Where the money comes from</h4>
        <p className="font-dm-sans text-sm text-ink-muted">Every source, what it&rsquo;s worth, and when it kicks in</p>
        <div className="mt-3 divide-y divide-[#ECE7DD]">
          {income.map((row) => (
            <div key={row.id} className="flex items-start justify-between py-2.5 gap-2">
              <div>
                <p className="font-dm-sans text-sm font-semibold text-ink">
                  {row.label}
                  {row.status_tag && <span className="ml-2 rounded-full bg-[#F1ECE0] px-2 py-0.5 font-dm-sans text-xs text-ink-muted">{row.status_tag}</span>}
                </p>
                {row.description && <p className="font-dm-sans text-xs text-ink-muted">{row.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-none">
                <span className="font-dm-sans text-sm font-semibold text-ink">
                  £{(row.amount_pence / 100).toLocaleString()}{row.cadence === "monthly" ? "/mo" : "/yr"}
                </span>
                <button onClick={() => removeIncome(row.id)} className="text-ink-faintest hover:text-ink transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <QuickAddRow onAdd={addIncome} />
      </div>

      <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
        <h4 className="font-dm-sans font-semibold text-ink">{copy.title}</h4>
        <p className="font-dm-sans text-sm text-ink-muted">{copy.subtitle}</p>
        <div className="mt-3 divide-y divide-[#ECE7DD]">
          {outgoings.map((row) => (
            <div key={row.id} className="flex items-start justify-between py-2.5 gap-2">
              <div>
                <p className="font-dm-sans text-sm font-semibold text-ink">
                  {row.label}
                  {row.tag && <span className="ml-2 rounded-full bg-[#F1ECE0] px-2 py-0.5 font-dm-sans text-xs text-ink-muted">{row.tag}</span>}
                </p>
                {row.description && <p className="font-dm-sans text-xs text-ink-muted">{row.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-none">
                <span className="font-dm-sans text-sm font-semibold text-ink">
                  £{(row.amount_pence / 100).toLocaleString()}{row.cadence === "monthly" ? "/mo" : "/yr"}
                </span>
                <button onClick={() => removeOutgoing(row.id)} className="text-ink-faintest hover:text-ink transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <QuickAddRow onAdd={addOutgoing} />
      </div>
    </div>
  );
}
