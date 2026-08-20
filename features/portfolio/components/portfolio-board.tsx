"use client";

import { useCallback, useEffect, useState } from "react";
import { CategorySection } from "./category-section";
import { ClinicalRotationsCard } from "./clinical-rotations-card";
import { SpecialtyApplicationsCard } from "./specialty-applications-card";
import { ResidentScorecard } from "./resident-scorecard";
import { PORTFOLIO_CATEGORIES } from "./data/portfolio-options";
import type { PortfolioEntry } from "./entry-card";

export function PortfolioBoard({ stage }: { stage: "med_student" | "resident" }) {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/portfolio");
    if (res.ok) {
      const { entries } = await res.json();
      setEntries(entries);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const totalLogged = entries.length;
  const totalSignedOff = entries.filter((e) => e.signed_off_at).length;

  return (
    <div className="space-y-6">
      <p className="font-dm-sans text-sm text-ink-muted">
        {totalLogged} entries logged · {totalSignedOff} signed off
      </p>

      {stage === "med_student" && <ClinicalRotationsCard />}
      {stage === "resident" && <SpecialtyApplicationsCard />}

      {stage === "resident" && <ResidentScorecard entries={entries} />}

      {loading ? (
        <p className="font-dm-sans text-sm text-ink-muted">Loading…</p>
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
  );
}
