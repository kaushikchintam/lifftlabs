import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JOURNEYS } from "@/features/journeys/config";

/** "Where are you in your healthcare career journey?" — a 2×2 grid on the landing page. */
const TILTS = ["-rotate-1", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"];

export function JourneyPicker() {
  return (
    <div id="journeys" className="scroll-mt-8 rounded-2xl border border-[#EDEFF3] bg-white p-4 md:p-[22px]">
      <h2 className="mb-3.5 text-center text-lg font-semibold tracking-tight text-lf-ink md:text-[22px]">
        Where are you in your healthcare career journey?
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* ponytail: finances hidden from the picker only; the journey still exists for mentors and old links */}
        {JOURNEYS.filter((j) => j.slug !== "finances").map((j, i) => {
          const Icon = j.icon;
          return (
            <Link
              key={j.slug}
              href={`/journey/${j.slug}`}
              className={`group relative flex min-h-[170px] flex-col justify-between rounded-[20px] p-6 transition-transform hover:rotate-0 hover:-translate-y-1 ${TILTS[i % TILTS.length]}`}
              style={{ background: j.accent.light, color: j.accent.dark }}
            >
              {/* Stitched inner border */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-2 rounded-[14px] border-2 border-dashed"
                style={{ borderColor: `${j.accent.dark}40` }}
              />
              <Icon size={26} strokeWidth={2} />
              <span className="flex items-end justify-between gap-3 text-[19px] font-bold leading-tight tracking-[-0.01em]">
                {j.cardLabel}
                <ArrowRight size={20} className="flex-none transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
