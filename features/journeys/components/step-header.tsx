import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Journey } from "@/features/journeys/config";

/** Back · Step x of 2 · progress bar · journey chip — shared by every step. */
export function StepHeader({
  journey,
  step,
  backHref,
}: {
  journey: Journey;
  step?: 1 | 2;
  backHref: string;
}) {
  const Icon = journey.icon;
  return (
    <div className="mb-8">
      <div className="mb-5 flex items-center justify-between text-[17px]">
        <Link href={backHref} className="inline-flex items-center gap-2 text-lf-ink hover:opacity-70">
          <ArrowLeft size={18} /> Back
        </Link>
        {step && <span className="text-lf-muted">Step {step} of 2</span>}
      </div>
      {step && (
        <div className="mb-9 grid grid-cols-2 gap-2">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 rounded-full ${s <= step ? "bg-lf-ink" : "bg-[#E2E2E2]"}`} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: journey.accent.light, color: journey.accent.dark }}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
        <span className="text-[17px] text-lf-muted">{journey.title}</span>
      </div>
    </div>
  );
}
