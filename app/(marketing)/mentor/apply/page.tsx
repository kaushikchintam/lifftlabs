import { ApplicationForm } from "@/features/mentor/components/application-form";

export const metadata = { title: "Become a LIFFT mentor" };

export default function MentorApplyPage() {
  return (
    <div className="bg-lf-page px-4 py-14 text-lf-ink">
      <div className="mx-auto max-w-[880px]">
        <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">Become a LIFFT mentor</h1>
        <p className="mb-8 text-lg text-lf-body">
          Tell us who you can help. We review every application by hand, then you set up payouts and your hours.
        </p>
        <ApplicationForm />
      </div>
    </div>
  );
}
