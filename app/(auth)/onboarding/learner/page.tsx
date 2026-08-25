"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";



type Step = 1 | 2 | 3 | 4 | 5;
type Direction = "forward" | "back";

const backgroundOptions = ["Finance", "Engineering", "Teaching", "Law", "Allied health", "Nursing", "Pharmacy", "Other"];
const destinationOptions = ["Into medicine (graduate entry)", "Into medicine (undergraduate)", "Change speciality", "Postgraduate exams", "Advance / leadership", "Not sure yet"];
const stageOptions = ["Applicant", "Medical student", "Resident doctor"];
const concernOptions = ["Ready for a bigger transition", "Worried it's too late", "Lost in the admissions maze", "Need a clear plan", "Worried about funding"];

export default function LearnerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<Direction>("forward");
  const [background, setBackground] = useState("");
  const [destination, setDestination] = useState("");
  const [concern, setConcern] = useState("");
  const [stage, setStage] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

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
    4: {
      label: "What type of learner are you?",
      sub: "This shapes which parts of the platform you see, you change it later as you progress.",
      options: stageOptions, 
      value: stage, 
      set: setStage,
    },
  };
  const current = step === 5 ? null : steps[step];

  async function submitOnboarding() {
    const res = await fetch("/api/onboarding/learner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_position: background,
        target_role: destination,
        primary_concern: concern,
        stage: stage === "Applicant" ? "applicant"
             : stage === "Medical student" ? "med_student"
             : "resident",
      }),
    });
    return res.ok;
  }

  async function subscribe() {
    setSubscribing(true);
    setSubscribeError(null);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    if (res.ok) {
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } else {
      setSubscribing(false);
      setSubscribeError("Couldn't start checkout — try again in a moment.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F1ECE0] flex flex-col px-10 md:px-24 py-8">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-20">
        <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">LIFFT LABS</span>
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
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
          Step {step} of 5
        </span>

        {current ? (
          <>
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

            {subscribeError && (
              <p className="mb-6 font-dm-sans text-sm text-red-700">{subscribeError}</p>
            )}

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
                  if (step < 4) {
                    goForward();
                  } else {
                    setSubscribeError(null);
                    const ok = await submitOnboarding();
                    if (!ok) {
                      setSubscribeError("Something went wrong saving your answers — try again.");
                      return;
                    }
                    goForward();
                  }
                }}
                disabled={!current.value}
                className="rounded-full bg-[#2596BE] hover:bg-[#1A7A9E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-dm-sans text-sm px-8 py-3 transition-colors"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Headline */}
            <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mb-4 max-w-xl">
              Everything, one plan
            </h1>

            {/* Subtext */}
            <p className="font-dm-sans text-[#6F6B60] text-base mb-6 max-w-lg">
              Mentors, video sessions, your evidence, your portfolio, your whole route through
              medicine one subscription, cancel any time.
            </p>

            <p className="font-dm-serif text-4xl text-[#18150F] mb-1">
              £11.99<span className="font-dm-sans text-base text-[#6F6B60]"> / month</span>
            </p>
            <p className="mb-10 font-dm-sans text-xs text-[#6F6B60]">
              Have a code? You&rsquo;ll get the chance to enter it at checkout.
            </p>

            {subscribeError && (
              <p className="mb-4 font-dm-sans text-sm text-red-700">{subscribeError}</p>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-6">
              <button
                onClick={subscribe}
                disabled={subscribing}
                className="rounded-full bg-[#2596BE] hover:bg-[#1A7A9E] disabled:opacity-40 text-white font-dm-sans text-sm px-8 py-3 transition-colors"
              >
                {subscribing ? "Redirecting…" : "Subscribe"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="font-dm-sans text-sm text-[#6F6B60] hover:text-[#18150F] transition-colors"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
