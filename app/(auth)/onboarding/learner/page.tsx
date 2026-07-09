"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";



type Step = 1 | 2 | 3;
type Direction = "forward" | "back";

const backgroundOptions = ["Finance", "Engineering", "Teaching", "Law", "Allied health", "Nursing", "Pharmacy", "Other"];
const destinationOptions = ["Into medicine (graduate entry)", "Into medicine (undergraduate)", "Change speciality", "Postgraduate exams", "Advance / leadership", "Not sure yet"];
const concernOptions = ["Ready for a bigger transition", "Worried it's too late", "Lost in the admissions maze", "Need a clear plan", "Worried about funding"];

export default function LearnerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<Direction>("forward");
  const [background, setBackground] = useState("");
  const [destination, setDestination] = useState("");
  const [concern, setConcern] = useState("");

  function goForward() {
    setDirection("forward");
    setStep((s) => (s + 1) as Step);
  }
  function goBack() {
    setDirection("back");
    setStep((s) => (s - 1) as Step);
  }

  const steps = {
    1: {
      label: "Where are you now?",
      sub: "Your background is an asset, it shapes how we together plan your route.",
      options: backgroundOptions,
      value: background,
      set: setBackground,
    },
    2: {
      label: "Where do you want to go?",
      sub: "Pick the move that pulls you most. You can change it later.",
      options: destinationOptions,
      value: destination,
      set: setDestination,
    },
    3: {
      label: "What's on your mind?",
      sub: "The honest answer helps us match the right mentor and plan.",
      options: concernOptions,
      value: concern,
      set: setConcern
    },
  };
  const current = steps[step];

  return (
    <div className="min-h-screen bg-[#F1ECE0] flex flex-col px-10 md:px-24 py-8">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-20">
        <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">LIFFT LABS</span>
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-[#2596BE]"
                  : s < step
                  ? "w-2 bg-[#2596BE]/40"
                  : "w-2 bg-[#18150F]/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content — key triggers remount for animation */}
      <div
        key={step}
        className={direction === "forward" ? "animate-slide-forward" : "animate-slide-back"}
      >
        {/* Step pill */}
        <span className="inline-block font-dm-sans text-xs text-[#18150F] border border-[#18150F]/30 rounded-full px-4 py-1.5 mb-6">
          Step {step} of 3
        </span>

        {/* Headline */}
        <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mb-4 max-w-xl">
          {current.label}
        </h1>

        {/* Subtext */}
        <p className="font-dm-sans text-[#6F6B60] text-base mb-10 max-w-lg">
          {current.sub}
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-3 mb-14">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => current.set(opt)}
              className={`rounded-full px-5 py-2.5 font-dm-sans text-sm border transition-colors ${
                current.value === opt
                  ? "bg-[#18150F] text-white border-[#18150F]"
                  : "bg-transparent text-[#18150F] border-[#18150F]/30 hover:border-[#18150F]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          {step > 1 && (
            <button
              onClick={goBack}
              className="font-dm-sans text-sm text-[#6F6B60] hover:text-[#18150F] transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={async () => {
              if (!current.value) return;
              if (step < 3) {
                goForward();
              } else {
                const res = await fetch("/api/onboarding/learner", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    current_position: background,
                    target_role: destination,
                    primary_concern: concern,
                  }),
                });
                if (!res.ok) return;
                router.push("/dashboard");
              }
            }}
            disabled={!current.value}
            className="rounded-full bg-[#2596BE] hover:bg-[#1A7A9E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-dm-sans text-sm px-8 py-3 transition-colors"
          >
            {step === 3 ? "Submit" : "Continue"}
          </button>
        </div>
      </div>

    </div>
  );
}
