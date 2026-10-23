import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JOURNEYS } from "@/features/journeys/config";

/** "Where are you in your healthcare journey?" — the 2×2 grid on the landing page. */
export function JourneyPicker() {
  return (
    <div id="journeys" className="scroll-mt-8 rounded-2xl border border-[#EDEFF3] bg-white p-4 md:p-[22px]">
      <h2 className="mb-3.5 text-center text-lg font-semibold tracking-tight text-lf-ink md:text-[22px]">
        Where are you in your healthcare journey?
      </h2>
      <div className="grid gap-3.5 sm:grid-cols-2">
        {JOURNEYS.map((j) => {
          const Icon = j.icon;
          return (
            <Link
              key={j.slug}
              href={`/journey/${j.slug}`}
              className="group flex items-center gap-3.5 rounded-xl border border-[#EDEFF3] p-[18px] transition-colors hover:border-lf-ink"
            >
              <div
                className="flex h-11 w-11 flex-none items-center justify-center rounded-xl"
                style={{ background: j.accent.light, color: j.accent.dark }}
              >
                <Icon size={21} strokeWidth={1.75} />
              </div>
              <span className="flex flex-1 items-center justify-between gap-3.5 text-[16.5px] leading-snug text-lf-ink">
                {j.cardLabel}
                <ArrowRight size={19} className="flex-none text-[#1C2D47] transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
