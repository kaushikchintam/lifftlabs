"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CategorySection } from "./category-section";
import { SchoolsCard, type School } from "./schools-card";
import { PORTFOLIO_CATEGORIES } from "./data/portfolio-options";
import type { PortfolioEntry } from "./entry-card";

export function PortfolioBoard() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [e, s] = await Promise.all([fetch("/api/portfolio"), fetch("/api/med-schools")]);
    if (e.ok) setEntries((await e.json()).entries);
    if (s.ok) setSchools((await s.json()).schools);
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signedOff = entries.filter((e) => e.signed_off_at).length;

  return (
    <>
      <PageHeader
        eyebrow="Evidence that follows you into applications"
        title="Portfolio"
        subtitle={`${entries.length} entries logged · ${signedOff} signed off · ${schools.length} schools tracked`}
      />

      <div className="space-y-6">
        <SchoolsCard schools={schools} onChange={refresh} />

        <div className="rounded-2xl border border-lf-line bg-white p-7">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-3xl font-bold tracking-tight">{signedOff} signed off</p>
            <p className="text-[15px] text-lf-muted">Across {PORTFOLIO_CATEGORIES.length} areas medical schools look for</p>
          </div>
          <div className="space-y-4">
            {PORTFOLIO_CATEGORIES.map((c) => {
              const mine = entries.filter((e) => e.category === c.value);
              const done = mine.filter((e) => e.signed_off_at).length;
              return (
                <div key={c.value}>
                  <div className="mb-1.5 flex justify-between text-[15px]">
                    <span>{c.label}</span>
                    <span className="text-lf-muted">{done} of {mine.length} signed off</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-lf-line">
                    <div className="h-1.5 rounded-full bg-lf-ink" style={{ width: mine.length ? `${(done / mine.length) * 100}%` : 0 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <p className="text-[15px] text-lf-muted">Loading…</p>
        ) : (
          PORTFOLIO_CATEGORIES.map((cat) => (
            <CategorySection
              key={cat.value}
              category={cat.value}
              entries={entries.filter((e) => e.category === cat.value)}
              onChange={refresh}
            />
          ))
        )}
      </div>
    </>
  );
}
