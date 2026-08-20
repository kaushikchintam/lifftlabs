"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

interface Cost {
  id: string;
  label: string;
  amount_pence: number;
  is_paid: boolean;
  due_note: string | null;
}

export function TransitionCostsChecklist() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/finances/transition-costs");
    if (res.ok) {
      const { costs } = await res.json();
      setCosts(costs);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unpaidPence = costs.filter((c) => !c.is_paid).reduce((sum, c) => sum + c.amount_pence, 0);

  async function togglePaid(cost: Cost) {
    setCosts((prev) => prev.map((c) => (c.id === cost.id ? { ...c, is_paid: !c.is_paid } : c)));
    await fetch(`/api/finances/transition-costs?id=${cost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !cost.is_paid }),
    });
  }

  async function handleAdd() {
    const pounds = Number(amount);
    if (!label.trim() || !pounds) return;
    setSaving(true);
    const res = await fetch("/api/finances/transition-costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, amountPence: Math.round(pounds * 100) }),
    });
    setSaving(false);
    if (res.ok) {
      setLabel("");
      setAmount("");
      setShowForm(false);
      refresh();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/finances/transition-costs?id=${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <h4 className="font-dm-sans font-semibold text-ink">Transition costs</h4>
      <p className="font-dm-sans text-sm text-ink-muted">£{(unpaidPence / 100).toLocaleString()} still unpaid</p>

      <div className="mt-3 divide-y divide-[#ECE7DD]">
        {costs.map((cost) => (
          <div key={cost.id} className="flex items-center justify-between py-2.5">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={cost.is_paid} onChange={() => togglePaid(cost)} />
              <span className={`font-dm-sans text-sm ${cost.is_paid ? "line-through text-ink-faintest" : "text-ink"}`}>
                {cost.label}
                {cost.due_note && <span className="block text-xs text-ink-muted">{cost.due_note}</span>}
              </span>
            </label>
            <div className="flex items-center gap-3">
              <span className="font-dm-sans text-sm font-semibold text-ink">£{(cost.amount_pence / 100).toLocaleString()}</span>
              <button onClick={() => handleDelete(cost.id)} className="text-ink-faintest hover:text-ink transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            className="flex-1 rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm"
            placeholder="Cost label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="w-24 rounded-lg border border-[#D8D2C2] px-3 py-2 font-dm-sans text-sm"
            placeholder="£"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="rounded-full bg-brand px-4 py-2 font-dm-sans text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="mt-3 font-dm-sans text-sm text-brand hover:underline">
          + Add a cost
        </button>
      )}
    </div>
  );
}
