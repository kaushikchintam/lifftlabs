// landing page
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RolePicker from "@/components/marketing/role-picker";
import { GradientBackground } from "@/components/ui/bloom-field-gradient";

const STEPS = [
  {
    title: "Stage-aware pathways",
    body: "Tell us where you are  applicant, medical student, or resident  and LIFFT shows the deadlines, checklist, and mentors that actually apply to you.",
  },
  {
    title: "Mentor matching",
    body: "Browse mentors who've made your exact move, see their real availability, and keep one conversation going for the whole relationship.",
  },
  {
    title: "Portfolio & evidence",
    body: "Shadowing, volunteering, teaching and hours logged as you go, mapped to person-spec domains and signed off by your mentor  not reconstructed the week before.",
  },
  {
    title: "Application tracking",
    body: "Every application step and deadline in one place, so nothing gets missed.",
  },
];

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <RolePicker open={open} onClose={() => setOpen(false)} />

      {/* Hero */}
      <section className="relative font-archivo font-black flex flex-col items-center justify-center px-6 py-20 md:py-32 min-h-[calc(100vh-73px)] overflow-hidden">
        <div className="absolute inset-0">
          <GradientBackground className="h-full w-full" />
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full">
          {/* Left: copy + CTAs */}
          <div className="text-center lg:text-left">
            <span className="inline-block border border-[#2596BE] text-[#2596BE] text-xs md:text-sm px-4 py-1 rounded-full mb-8 bg-white/70">
              Powering tomorrow's healthcare workforce
            </span>
            <h1 className="font-archivo font-black text-3xl md:text-5xl text-[#18150F] leading-tight mb-6">
              Your one stop shop for career changes and retraining.
            </h1>
            <p className="font-sligoil text-[#3A372F] text-base md:text-lg leading-relaxed mb-10">
              LIFFT is the platform for retraining into medicine and advancing
              within it — personalised pathways, expert mentorship and
              structured learning.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button
                className="h-auto bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full px-8 py-3 text-base font-sligoil font-semibold"
                onClick={() => setOpen(true)}
              >
                I'm a professional
              </Button>
              <Button
                className="h-auto bg-[#F4A261] hover:bg-[#E8934A] text-[#18150F] rounded-full px-8 py-3 text-base font-sligoil font-semibold"
                onClick={() => router.push("/signup/mentor")}
              >
                I'm a mentor
              </Button>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="relative hidden lg:block">
            <span className="absolute -top-5 -right-4 z-10 rounded-full bg-[#DB8871] text-[#18150F] text-xs font-sligoil font-semibold px-4 py-1.5 shadow-md rotate-3">
              Mentor sign-off built in
            </span>

            <div className="rounded-2xl border border-[#ECE7DD] bg-white shadow-xl overflow-hidden">
              {/* browser chrome */}
              <div className="flex items-center gap-2 bg-[#F2F4F6] px-4 py-2.5 border-b border-[#ECE7DD]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E2D6]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E2D6]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8E2D6]" />
                <span className="ml-3 font-sligoil text-xs text-[#8A857A]">lifft.app / portfolio</span>
              </div>

              <div className="p-6 bg-[#FBF7EE]">
                <p className="font-sligoil text-xs font-semibold tracking-widest text-[#448DB1] mb-2">
                  — EVIDENCE THAT FOLLOWS YOU INTO APPLICATIONS
                </p>
                <h3 className="font-archivo font-black text-2xl text-[#18150F] mb-1">Portfolio</h3>
                <p className="font-sligoil text-sm text-[#6F6B60] mb-5">12 entries logged · 9 signed off</p>

                {/* progress card */}
                <div className="rounded-xl border border-[#ECE7DD] bg-white p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-archivo font-black text-base text-[#18150F]">9 signed off</span>
                    <span className="font-sligoil text-xs text-[#8A857A]">Across 4 person-spec domains</span>
                  </div>
                  {[
                    { label: "Research", value: "4 of 4", pct: 100, color: "#448DB1" },
                    { label: "Teaching", value: "3 of 4", pct: 75, color: "#E8BB6B" },
                    { label: "Leadership", value: "2 of 3", pct: 66, color: "#67A887" },
                    { label: "Commitment to specialty", value: "0 of 1", pct: 8, color: "#DB8871" },
                  ].map((row) => (
                    <div key={row.label} className="mb-3 last:mb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sligoil text-sm text-[#18150F]">{row.label}</span>
                        <span className="font-sligoil text-sm text-[#8A857A]">{row.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F1ECE0] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* entry card */}
                <div className="rounded-xl border border-[#ECE7DD] bg-white p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-archivo font-black text-base text-[#18150F]">Antibiotic stewardship audit</span>
                    <span className="font-sligoil text-xs bg-[#E3F0E8] text-[#67A887] rounded-full px-2.5 py-0.5">
                      Poster presentation
                    </span>
                  </div>
                  <p className="font-sligoil text-sm text-[#8A857A] mb-3">Regional Trainee Research Day · May 26</p>
                  <div className="flex items-center gap-4">
                    <span className="font-sligoil text-sm text-[#448DB1] font-medium">Add evidence</span>
                    <span className="font-sligoil text-sm text-[#67A887] font-medium">✓ Signed off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="border-t border-[#18150F]/15 pt-6 mb-10">
            <span className="font-sligoil text-xs font-semibold tracking-widest text-[#448DB1]">
              — HOW IT WORKS
            </span>
          </div>

          <h2 className="font-archivo font-black text-4xl md:text-6xl text-[#18150F] leading-[1.05] max-w-3xl mb-14 md:mb-20">
            Four things that actually happen here.
          </h2>

          <div className="divide-y divide-[#18150F]/10 border-t border-[#18150F]/10">
            {STEPS.map(({ title, body }, i) => (
              <div
                key={title}
                className="grid grid-cols-[70px_1fr] md:grid-cols-[140px_1fr] gap-6 md:gap-12 py-10 md:py-12"
              >
                <span className="font-archivo font-black text-4xl md:text-5xl text-[#448DB1]/25">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-archivo font-black text-xl md:text-2xl text-[#18150F] mb-3">
                    {title}
                  </h3>
                  <p className="font-sligoil text-sm md:text-base text-[#3A372F] leading-relaxed max-w-lg">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section id="mentors" className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="absolute inset-0">
          <GradientBackground className="h-full w-full" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-archivo font-black text-2xl md:text-3xl text-[#18150F] mb-4">
            Working in healthcare? Mentor the next generation.
          </h2>
          <p className="font-sligoil text-[#3A372F] max-w-xl mx-auto leading-relaxed mb-8">
            Share what you've learned, on your own schedule. Publish the times
            you're open, get paid per session, and help someone make the leap
            you once made.
          </p>
          <Button
            className="h-auto bg-[#18150F] hover:bg-[#2d2a22] text-white rounded-full px-8 py-3 text-base font-sligoil font-semibold"
            onClick={() => setOpen(true)}
          >
            Become a mentor
          </Button>
        </div>
      </section>
    </>
  );
}