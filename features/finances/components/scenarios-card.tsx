export function ScenariosCard({
  totalFundPence,
  monthlyShortfallPence,
  monthlyPartTimeIncomePence,
}: {
  totalFundPence: number;
  monthlyShortfallPence: number;
  monthlyPartTimeIncomePence: number;
}) {
  const monthsFor = (extraShortfallPence: number) => {
    const shortfall = monthlyShortfallPence + extraShortfallPence;
    if (shortfall <= 0) return "—";
    return Math.floor(totalFundPence / shortfall);
  };

  // Losing part-time income doesn't change what you spend, only what
  // covers it — so the shortfall grows by exactly what that income was
  // covering, i.e. the part-time income itself.
  const scenarios = [
    { label: "Plan holds (current shortfall)", months: monthsFor(0) },
    { label: "Shortfall +£300/mo (rent rise, etc.)", months: monthsFor(30000) },
    {
      label:
        monthlyPartTimeIncomePence > 0
          ? `Full-time study, no part-time income (−£${(monthlyPartTimeIncomePence / 100).toLocaleString()}/mo)`
          : "Full-time study, no part-time income",
      months: monthsFor(monthlyPartTimeIncomePence),
    },
  ];

  return (
    <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
      <h4 className="font-dm-sans font-semibold text-ink">Scenarios — recalculated live</h4>
      <div className="mt-3 space-y-3">
        {scenarios.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="flex h-4 w-4 flex-none items-center justify-center rounded-full border border-brand text-brand text-[10px]">✓</span>
            <div>
              <p className="font-dm-sans text-sm font-semibold text-ink">{s.label}</p>
              <p className="font-dm-sans text-sm text-ink-muted">{s.months} months</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 font-dm-sans text-xs text-ink-muted">
        Based on £{(totalFundPence / 100).toLocaleString()} total fund (savings + pot).
      </p>
    </div>
  );
}
