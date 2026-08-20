"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, CalendarClock, Lightbulb } from "lucide-react";
import { FUNDING_SCHEMES } from "./data/funding-schemes";
import type { FinanceStage } from "./data/pot-configs";

const STATUS_CYCLE = ["not_checked", "looks_eligible", "applied", "received"] as const;
type SchemeStatus = (typeof STATUS_CYCLE)[number];

interface Progress {
  scheme_slug: string;
  status: SchemeStatus;
  actual_amount_pence: number | null;
}

const STATUS_LABEL: Record<SchemeStatus, string> = {
  not_checked: "",
  looks_eligible: "Looks eligible",
  applied: "Applied",
  received: "Received",
};

export function FundingSchemesCard({ stage }: { stage: FinanceStage }) {
  const schemes = FUNDING_SCHEMES[stage];
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [actualInput, setActualInput] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/finances/funding-schemes");
    if (res.ok) {
      const { progress } = await res.json();
      const map: Record<string, Progress> = {};
      for (const p of progress as Progress[]) map[p.scheme_slug] = p;
      setProgress(map);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function statusOf(slug: string): SchemeStatus {
    return progress[slug]?.status ?? "not_checked";
  }

  async function cycleStatus(slug: string) {
    const current = statusOf(slug);
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    const existingActual = progress[slug]?.actual_amount_pence ?? null;
    setProgress((prev) => ({ ...prev, [slug]: { scheme_slug: slug, status: next, actual_amount_pence: existingActual } }));
    await fetch("/api/finances/funding-schemes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemeSlug: slug, status: next, actualAmountPence: existingActual }),
    });
  }

  async function saveActualAmount(slug: string) {
    const pounds = Number(actualInput);
    if (!pounds && pounds !== 0) return;
    await fetch("/api/finances/funding-schemes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemeSlug: slug, status: "received", actualAmountPence: Math.round(pounds * 100) }),
    });
    setActualInput("");
    refresh();
  }

  const availablePence = schemes.reduce((sum, s) => sum + s.typicalAmountPence, 0);
  const inHandPence = schemes.reduce((sum, s) => {
    const p = progress[s.slug];
    return p?.status === "received" ? sum + (p.actual_amount_pence ?? s.typicalAmountPence) : sum;
  }, 0);
  const appliedOrEligiblePence = schemes.reduce((sum, s) => {
    const p = progress[s.slug];
    return p?.status === "applied" || p?.status === "looks_eligible" ? sum + s.typicalAmountPence : sum;
  }, 0);
  const notCheckedCount = schemes.filter((s) => statusOf(s.slug) === "not_checked").length;

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <h3 className="font-dm-serif text-2xl text-ink">Funding you don&rsquo;t have to save for</h3>
      <p className="mt-1 font-dm-sans text-sm text-ink-muted">
        Around £{(availablePence / 100).toLocaleString()} is available from schemes rather than your own savings. Most of it goes unclaimed because nobody tells you it exists.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-brand-tint/40 p-4">
          <p className="font-dm-serif text-2xl text-ink">£{(inHandPence / 100).toLocaleString()}</p>
          <p className="font-dm-sans text-xs text-ink-muted">In hand — offsetting your goal</p>
        </div>
        <div className="rounded-xl border border-[#ECE7DD] p-4">
          <p className="font-dm-serif text-2xl text-ink">£{(appliedOrEligiblePence / 100).toLocaleString()}</p>
          <p className="font-dm-sans text-xs text-ink-muted">Applied for or eligible</p>
        </div>
        <div className="rounded-xl border border-[#ECE7DD] p-4">
          <p className="font-dm-serif text-2xl text-ink">{notCheckedCount}</p>
          <p className="font-dm-sans text-xs text-ink-muted">Schemes you haven&rsquo;t checked</p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-[#ECE7DD]">
        {schemes.map((scheme) => {
          const status = statusOf(scheme.slug);
          const isOpen = expandedSlug === scheme.slug;
          const p = progress[scheme.slug];
          return (
            <div key={scheme.slug} className="py-3">
              <div className="flex w-full items-center gap-3">
                <button
                  onClick={() => cycleStatus(scheme.slug)}
                  title="Click to move this scheme on"
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors ${
                    status === "received" ? "border-brand bg-brand" : "border-ink-faintest"
                  }`}
                >
                  {status === "received" && <span className="text-white text-[10px]">✓</span>}
                </button>
                <button onClick={() => setExpandedSlug(isOpen ? null : scheme.slug)} className="flex flex-1 flex-wrap items-center gap-2 text-left">
                  <span className="font-dm-sans font-semibold text-ink">{scheme.name}</span>
                  <span className="rounded-full bg-[#F1ECE0] px-2.5 py-0.5 font-dm-sans text-xs text-ink-muted">
                    {status === "received"
                      ? `£${((p?.actual_amount_pence ?? scheme.typicalAmountPence) / 100).toLocaleString()} received`
                      : `~£${(scheme.typicalAmountPence / 100).toLocaleString()}`}
                  </span>
                  {status !== "not_checked" && status !== "received" && (
                    <span className="font-dm-sans text-xs text-brand">{STATUS_LABEL[status]}</span>
                  )}
                </button>
              </div>

              {isOpen && (
                <div className="mt-2 space-y-1.5 pl-8">
                  <p className="font-dm-sans text-sm text-ink-muted">{scheme.description}</p>
                  <p className="flex items-center gap-2 font-dm-sans text-sm text-ink-muted">
                    <Users size={13} /> {scheme.eligibility}
                  </p>
                  <p className="flex items-center gap-2 font-dm-sans text-sm text-ink-muted">
                    <CalendarClock size={13} /> {scheme.timing}
                  </p>
                  <p className="flex items-center gap-2 font-dm-sans text-sm text-ink-muted">
                    <Lightbulb size={13} /> {scheme.tip}
                  </p>

                  {status === "received" && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-dm-sans text-sm text-ink-muted">Actual amount</span>
                      <input
                        className="w-24 rounded-lg border border-[#D8D2C2] px-2 py-1 font-dm-sans text-sm"
                        placeholder="£"
                        value={actualInput}
                        onChange={(e) => setActualInput(e.target.value)}
                      />
                      <button onClick={() => saveActualAmount(scheme.slug)} className="font-dm-sans text-sm text-brand hover:underline">
                        Save
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 font-dm-sans text-xs text-ink-muted">
        Click the circle to move a scheme on: not checked → looks eligible → applied → received. Amounts are typical, not guaranteed — open a row for who qualifies and by when.
      </p>
    </div>
  );
}
