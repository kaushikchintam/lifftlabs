interface ChecklistHeaderProps {
  doneSteps: number;
  totalSteps: number;
}

/** Pure function of the counts computed in ChecklistBoard — no fetch, no
 *  route of its own. "27%" and "3 of 11" are both derived here, not stored. */
export function ChecklistHeader({ doneSteps, totalSteps }: ChecklistHeaderProps) {
  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 font-dm-sans text-xs font-bold uppercase tracking-wide text-[#1A665A]">
            <span className="inline-block h-px w-4 bg-[#1A665A]" />
            My preparation
          </span>
          <h1 className="font-dm-serif text-5xl text-ink">Application checklist</h1>
          <p className="mt-2 max-w-2xl font-dm-sans text-[15px] leading-relaxed text-ink-muted">
            Track your medical school entry milestones. Ensure all academic
            transcripts are ordered and test results are logged ahead of
            direct deadlines.
          </p>
        </div>

        <span className="flex-none rounded-full bg-[#FEF3C7] px-4 py-1.5 font-dm-sans text-sm font-semibold text-[#92400E]">
          {doneSteps} of {totalSteps} completed
        </span>
      </div>

      <div className="rounded-2xl border border-[#ECE7DD] bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-dm-sans text-sm font-semibold text-ink">Overall Readiness</p>
          <p className="font-dm-sans text-sm font-bold text-[#1A665A]">{percent}%</p>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#ECE7DD]">
          <div
            className="h-full rounded-full bg-[#1A665A] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
