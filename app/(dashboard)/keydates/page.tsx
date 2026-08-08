import KeyDatesCalendar from "@/features/keydates/components/application-calendar";
import ApplicationTimeline from "@/features/keydates/components/application-timeline";
import { NextStepsPanel } from "@/features/keydates/components/next-steps-panel";

export default function KeyDatesPage() {
  return (
    <div className="min-h-full bg-[#FAF8F3] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 font-dm-sans text-xs font-bold uppercase tracking-wide text-[#2D6A4F]">
            <span className="inline-block h-px w-4 bg-[#2D6A4F]" />
            Key dates
          </span>
          <h1 className="font-dm-serif text-5xl text-ink">
            Application calendar
          </h1>
          <p className="mt-2 font-dm-sans text-[15px] leading-relaxed text-ink-muted">
            The UCAS dates that are the same for every UK medical school. Solid
            chips are hard deadlines; the faded bands are seasons.
          </p>
        </div>

        <KeyDatesCalendar />

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <ApplicationTimeline />
          <NextStepsPanel />
        </div>
      </div>
    </div>
  );
}
