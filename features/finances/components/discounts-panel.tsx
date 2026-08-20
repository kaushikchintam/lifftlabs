import { DISCOUNTS } from "./data/discounts";
import type { FinanceStage } from "./data/pot-configs";

export function DiscountsPanel({ stage }: { stage: FinanceStage }) {
  const discounts = DISCOUNTS[stage];

  return (
    <div className="rounded-2xl bg-brand-tint/40 border border-brand-tint p-5">
      <h4 className="font-dm-sans font-semibold text-ink">Discounts you&rsquo;re eligible for</h4>
      <p className="mt-1 font-dm-sans text-sm text-ink-muted">Money back just for being a student — claim them all</p>

      {discounts.length === 0 ? (
        <p className="mt-3 font-dm-sans text-sm text-ink-muted">Nothing here yet for this stage.</p>
      ) : (
        <div className="mt-3 divide-y divide-brand-tint">
          {discounts.map((d) => (
            <div key={d.slug} className="py-2.5">
              <p className="font-dm-sans text-sm font-semibold text-ink">{d.title}</p>
              <p className="font-dm-sans text-sm text-ink-muted">{d.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
