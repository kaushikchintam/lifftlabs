import { PORTFOLIO_CATEGORIES } from "./data/portfolio-options";
import type { PortfolioEntry } from "./entry-card";

export function ResidentScorecard({ entries }: { entries: PortfolioEntry[] }) {
  const signedOffCount = entries.filter((e) => e.signed_off_at).length;

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="font-dm-serif text-2xl text-ink">{signedOffCount} signed off</h3>
        <span className="font-dm-sans text-sm text-ink-muted">Across {PORTFOLIO_CATEGORIES.length} person-spec domains</span>
      </div>

      <div className="mt-4 space-y-3">
        {PORTFOLIO_CATEGORIES.map((cat) => {
          const catEntries = entries.filter((e) => e.category === cat.value);
          const catSignedOff = catEntries.filter((e) => e.signed_off_at).length;
          const pct = catEntries.length > 0 ? (catSignedOff / catEntries.length) * 100 : 0;
          return (
            <div key={cat.value}>
              <div className="flex items-center justify-between font-dm-sans text-sm">
                <span className="text-ink">{cat.label}</span>
                <span className="text-ink-muted">{catSignedOff} of {catEntries.length} signed off</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[#F1ECE0]">
                <div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
