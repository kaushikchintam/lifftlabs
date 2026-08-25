"use client";

import {  mentorApplicationSchema} from "@/features/auth/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientBackground } from "@/components/ui/bloom-field-gradient";

export default function MentorSignupPage() {
    const [fullName, setFullName] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [linkedinOrPortfolio, setLinkedinOrPortfolio] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();


return (
    <div className="relative flex h-screen overflow-hidden">
        <div className="absolute inset-0">
          <GradientBackground className="h-full w-full" />
        </div>

        {/* Left panel */}
    <div className="relative z-10 hidden md:flex w-1/2 items-center justify-center">
        <h1 className="font-archivo-black text-white text-8xl leading-none tracking-tight drop-shadow-lg">
          LIFFT<br />LABS
        </h1>
    </div>
    {/* Right panel */}
    <div className="relative z-10 flex w-full md:w-1/2 items-center justify-center px-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-sm">

        <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mb-4">Apply to coach</h1>
        <p className="font-sligoil text-[#6F6B60] text-base mb-10">We review every coach by hand. It takes two minutes to start.</p>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-sligoil text-sm font-semibold text-[#18150F]">Full name</label>
            <input
              type="text"
              placeholder="Dr. Amara Nwosu"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(""); }}
              className="font-sligoil bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sligoil text-sm font-semibold text-[#18150F]">Work email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={workEmail}
              onChange={(e) => { setWorkEmail(e.target.value); setError(""); }}
              className="font-sligoil bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sligoil text-sm font-semibold text-[#18150F]">LinkedIn or portfolio</label>
            <input
              type="url"
              placeholder="linkedin.com/in/..."
              value={linkedinOrPortfolio}
              onChange={(e) => { setLinkedinOrPortfolio(e.target.value); setError(""); }}
              className="font-sligoil bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          {error && <p className="font-sligoil text-xs text-[#E63946]">{error}</p>}

          <Button
            onClick={async () => {
              const result = mentorApplicationSchema.safeParse({ fullName, workEmail, linkedinOrPortfolio });
              if (!result.success) {
                setError(result.error.issues[0].message);
                return;
              }
              const res = await fetch("/api/mentors/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, workEmail, linkedinOrPortfolio }),
              });
              if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Something went wrong.");
                return;
              }
              router.push("/signup/mentor/applied");
            }}
            className="h-auto w-full bg-[#4A7C59] hover:bg-[#3A6347] text-white rounded-full py-4 font-sligoil font-semibold text-base"
          >
            Start application
          </Button>
        </div>

        <p className="font-sligoil text-sm text-[#6F6B60] text-center mt-8">
          Already a coach?{" "}
          <Link href="/login" className="text-[#2596BE] font-medium hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  </div>
);

}