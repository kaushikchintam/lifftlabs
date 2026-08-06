import KeyDatesCalendar from "@/features/keydates/components/application-calendar";
import { NextStepsPanel } from "@/features/keydates/components/next-steps-panel";

export default function KeyDatesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <span className="mb-3 inline-flex rounded-full border border-[#E8E2D6] bg-[#FBF7EE] px-3 py-1 font-dm-sans text-xs font-semibold uppercase tracking-wide text-[#6F6B60]">
          Key dates
        </span>
        <NextStepsPanel />
        <h1 className="font-dm-serif text-4xl font-normal tracking-tight text-[#18150F]">
          Application calendar
        </h1>
        <p className="mt-1 font-dm-sans text-[15px] leading-relaxed text-[#6F6B60]">
          The UCAS dates that are the same for every UK medical school. Solid
          chips are hard deadlines; the faded bands are seasons.
        </p>
      </div>

      <KeyDatesCalendar />
    </div>
  );
}