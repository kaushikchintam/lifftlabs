import { Lock } from "lucide-react";
import { PORTFOLIO_CATEGORIES } from "./data/portfolio-options";
import { TestScoresCard } from "./test-scores-card";

export function ApplicantLockedView({
  experienceHours,
  testScoresCount,
}: {
  experienceHours: number;
  testScoresCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-brand-tint/40 border border-brand-tint px-5 py-4">
        <p className="font-dm-sans text-sm text-ink">
          At your stage the portfolio <em>is</em> your experience log plus your test scores — formal portfolio categories start once you&rsquo;re in med school. Nothing below is expected of you yet; it&rsquo;s here so you know what&rsquo;s coming.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
          <p className="font-dm-sans text-sm text-ink-muted">Experience hours</p>
          <p className="mt-1 font-dm-serif text-4xl text-ink">{experienceHours}</p>
          <p className="mt-1 font-dm-sans text-xs text-ink-muted">Your strongest evidence right now</p>
        </div>
        <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
          <p className="font-dm-sans text-sm text-ink-muted">Test scores</p>
          <p className="mt-1 font-dm-serif text-4xl text-ink">{testScoresCount}</p>
          <p className="mt-1 font-dm-sans text-xs text-ink-muted">Sittings logged</p>
        </div>
      </div>

      <TestScoresCard />

      <div className="rounded-2xl border border-[#ECE7DD] bg-white p-5 shadow-sm">
        <h4 className="font-dm-sans font-semibold text-ink mb-3">What starts counting the day you matriculate</h4>
        <div className="divide-y divide-[#ECE7DD]">
          {PORTFOLIO_CATEGORIES.map((cat) => (
            <div key={cat.value} className="flex items-center gap-2 py-2.5">
              <Lock size={14} className="text-ink-faintest" />
              <span className="font-dm-sans text-sm text-ink-muted">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
