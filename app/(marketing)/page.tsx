// landing page
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import RolePicker from "@/components/marketing/role-picker";
import { CalendarDays, Video, MessageCircle } from "lucide-react";

const STEPS = [
  {
    icon: CalendarDays,
    title: "Find your mentor",
    body: "Browse mentors who've made the exact transition you're planning — and see their real availability.",
  },
  {
    icon: Video,
    title: "Book a session",
    body: "Pick a time, pay securely, and it lands straight in both calendars. Video call included — nothing to install.",
  },
  {
    icon: MessageCircle,
    title: "Keep the momentum",
    body: "Message your mentor between sessions and build on every conversation as your application takes shape.",
  },
];

export default function HomePage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RolePicker open={open} onClose={() => setOpen(false)} />

      {/* Hero */}
      <section className="font-archivo-black flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 bg-[#DDEBF3] min-h-[calc(100vh-73px)]">
        <span className="inline-block border border-[#2596BE] text-[#2596BE] text-xs md:text-sm px-4 py-1 rounded-full mb-8">
          Powering tomorrow's healthcare workforce
        </span>
        <h1 className="font-archivo-black text-3xl md:text-5xl text-[#18150F] max-w-2xl leading-tight mb-6">
          Retraining made easier.
        </h1>
        <p className="font-dm-sans text-[#3A372F] text-base md:text-lg max-w-xl leading-relaxed mb-10">
          LIFFT is the platform for retraining into medicine and advancing
          within it — personalised pathways, expert mentorship and structured
          learning.
        </p>
        <Button
          className="h-auto bg-[#2596BE] hover:bg-[#1A7A9E] text-white rounded-full px-8 py-3 text-base font-dm-sans font-semibold"
          onClick={() => setOpen(true)}
        >
          I'm a professional
        </Button>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-archivo-black text-2xl md:text-3xl text-[#18150F] text-center mb-4">
            How it works
          </h2>
          <p className="font-dm-sans text-[#6F6B60] text-center max-w-xl mx-auto mb-10 md:mb-14">
            One-to-one sessions with people who've already walked your path —
            booked in minutes.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="border border-[#E8E2D6] rounded-xl p-6 md:p-8 bg-[#FBF7EE]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#18150F] flex items-center justify-center">
                    <Icon size={16} className="text-white" strokeWidth={1.5} />
                  </div>
                  <span className="font-archivo-black text-sm text-[#6F6B60]">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-archivo-black text-lg text-[#18150F] mb-2">
                  {title}
                </h3>
                <p className="font-dm-sans text-sm text-[#3A372F] leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section id="mentors" className="bg-[#FBF7EE] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-archivo-black text-2xl md:text-3xl text-[#18150F] mb-4">
            Working in healthcare? Mentor the next generation.
          </h2>
          <p className="font-dm-sans text-[#3A372F] max-w-xl mx-auto leading-relaxed mb-8">
            Share what you've learned, on your own schedule. Publish the times
            you're open, get paid per session, and help someone make the leap
            you once made.
          </p>
          <Button
            className="h-auto bg-[#18150F] hover:bg-[#2d2a22] text-white rounded-full px-8 py-3 text-base font-dm-sans font-semibold"
            onClick={() => setOpen(true)}
          >
            Become a mentor
          </Button>
        </div>
      </section>
    </>
  );
}