"use client";

import {  mentorApplicationSchema} from "@/features/auth/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MentorSignupPage() {
    const [fullName, setFullName] = useState("");
    const [workEmail, setWorkEmail] = useState("");
    const [linkedinOrPortfolio, setLinkedinOrPortfolio] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();


return (
    <div className="flex h-screen">
        {/* Left panel */}
    <div className="relative hidden md:flex w-1/2">
        <img src="/images/mentor-signup.jpg" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 60%)"}} />
    <div className="absolute inset-0 flex flex-col justify-between p-10">
        <span className="font-archivo-black text-white text-sm tracking-widest uppercase">LIFFT LABS</span>
        <div>
            <h2 className="font-archivo-black text-white text-4xl leading-tight mb-4">Be the person who tells them its possible.</h2>
            <p className="font-dm-sans text-white/80 text-base italic">You made the leap. Now help someone behind you make theirs.</p>
        </div>
        <span className="font-dm-sans text-white/60 text-sm">Set your rate keep 80% coach on your hours</span>
    </div>
    </div>
    {/* Right panel */}
    <div className="flex w-full md:w-1/2 bg-[#F1ECE0] items-center justify-center px-12">
      <div className="w-full max-w-md py-20">

        <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mb-4">Apply to coach</h1>
        <p className="font-dm-sans text-[#6F6B60] text-base mb-10">We review every coach by hand. It takes two minutes to start.</p>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-dm-sans text-sm font-semibold text-[#18150F]">Full name</label>
            <input
              type="text"
              placeholder="Dr. Amara Nwosu"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(""); }}
              className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-dm-sans text-sm font-semibold text-[#18150F]">Work email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={workEmail}
              onChange={(e) => { setWorkEmail(e.target.value); setError(""); }}
              className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-dm-sans text-sm font-semibold text-[#18150F]">LinkedIn or portfolio</label>
            <input
              type="url"
              placeholder="linkedin.com/in/..."
              value={linkedinOrPortfolio}
              onChange={(e) => { setLinkedinOrPortfolio(e.target.value); setError(""); }}
              className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
            />
          </div>

          {error && <p className="font-dm-sans text-xs text-[#E63946]">{error}</p>}

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
            className="h-auto w-full bg-[#4A7C59] hover:bg-[#3A6347] text-white rounded-full py-4 font-dm-sans font-semibold text-base"
          >
            Start application
          </Button>
        </div>

        <p className="font-dm-sans text-sm text-[#6F6B60] text-center mt-8">
          Already a coach?{" "}
          <Link href="/login" className="text-[#2596BE] font-medium hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  </div>
);

}