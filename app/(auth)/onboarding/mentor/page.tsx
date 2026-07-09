"use client";
import {useState} from "react";
import { useRouter } from "next/navigation";



type Step = 1 | 2 | 3 | 4;
type Direction = "forward" | "back";

const specialtyOptions = ["Into Medicine", "Change of speciality", "Postgradute exams", "Into leadership", "Into Research", "Into industry", "Others"]
const availableDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const hourlyRate = ["£40/hr", "£60/hr", "£80/hr", "£100/hr", "£120/hr", "£150/hr+"]

 
export default function MentorOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [direction, setDirection] = useState<Direction>("forward");
    const [speciality, setSpeciality] = useState("");
    const [oneLiner, setOneLiner] = useState("");
    const [available, setAvailable] = useState<string[]>([]);
    const [hourly, setHourly] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
            label: "What leap did you make?",
            sub: "Your transition is your credential. Pick the one that defines you.",
            options: specialtyOptions,
            value: speciality,
            set: setSpeciality,
        },
        2: {
            label: "When can you coach?",
            sub: "Pick any days that work. You can update this any time.",
            options: availableDays,
            value: available,
            set: setAvailable,
        },
        3: {
            label: "Set your hourly rate",
            sub: "You keep 80% of every session. Set a rate you're comfortable with.",
            options: hourlyRate,
            value: hourly,
            set: setHourly,
        },
    } as const; //keeps object types literal 

    // Cast the step safely nly when it is less than 4
    const current = step < 4 ? steps[step as Exclude<Step, 4>]: null;

    const isDisabled =
        step === 1 ? !speciality || !oneLiner :
        step === 2 ? available.length === 0 :
        step === 3 ? !hourly:
        password.length < 8 || password !== confirmPassword 

    return (
        <div className="min-h-screen bg-[#F1ECE0] flex flex-col px-10 md:px-24 py-8">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-20">
                <span className="font-archivo-black text-[#18150F] text-sm tracking-widest uppercase">LIFFT LABS</span>
                <div className="flex items-center gap-2">
                    {([1, 2, 3, 4] as Step[]).map((s) => (
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

            {/* Step content */}
            <div
                key={step}
                className={direction === "forward" ? "animate-slide-forward" : "animate-slide-back"}
            >
                <span className="inline-block font-dm-sans text-xs text-[#18150F] border border-[#18150F]/30 rounded-full px-4 py-1.5 mb-6">
                    Step {step} of 4
                </span>
                
                {/* 1. Add conditional checks for step 4 text */}
                <h1 className="font-dm-serif text-5xl text-[#18150F] leading-tight mb-4 max-w-xl">
                    {current? current.label: "Create your account"}
                </h1>

                <p className="font-dm-sans text-[#6F6B60] text-base mb-10 max-w-lg">
                    {current? current.sub: "Set up a password so you can log back in any time."}
                </p>

                {/* Chips */}
                {step < 4 && (
                <div className="flex flex-wrap gap-3 mb-14">
                    {current?.options.map((opt) => {
                        const isSelected = step === 2
                            ? available.includes(opt)
                            : current?.value === opt;

                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    if (step === 2) {
                                        setAvailable((prev) =>
                                            prev.includes(opt)
                                                ? prev.filter((d) => d !== opt)
                                                : [...prev, opt]
                                        );
                                    } else {
                                        (current?.set as (v: string) => void)(opt);
                                    }
                                }}
                                className={`rounded-full px-5 py-2.5 font-dm-sans text-sm border transition-colors ${
                                    isSelected
                                        ? "bg-[#18150F] text-white border-[#18150F]"
                                        : "bg-transparent text-[#18150F] border-[#18150F]/30 hover:border-[#18150F]"
                                }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
                )}

                {/* One-liner input — step 1 only */}
                {step === 1 && (
                    <div className="flex flex-col gap-2 mb-14">
                        <label className="font-dm-sans text-sm font-semibold text-[#18150F]">
                            Your one-line story (clients see this first)
                        </label>
                        <input
                            type="text"
                            placeholder="I left finance to study medicine at 29 — I know exactly how impossible the leap feels."
                            value={oneLiner}
                            onChange={(e) => setOneLiner(e.target.value)}
                            className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
                        />
                    </div>
                )}

                {/* Password inputs - Step 4 */}
                {step === 4 && (
                    <div className="flex flex-col gap-6 mb-14">
                        <div className="flex flex-col gap-2">
                            <label className="font-dm-sans text-sm font-semibold text-[#18150F]">
                                Password
                            </label>
                            <input 
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
                            />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-dm-sans text-sm font-semibold text-[#18150F]">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="font-dm-sans bg-transparent border border-[#18150F]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#18150F]/50 transition-colors placeholder:text-[#18150F]/30"
                                />
                            </div>
                        </div>
                )}

                {/* Navigation */}
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
                            if (step < 4) {
                                goForward();
                            } else {
                                await fetch("/api/onboarding/mentor", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        specialty: speciality,
                                        one_liner: oneLiner,
                                        available_days: available,
                                        hourly_rate: hourly,
                                        password: password
                                    }),
                                });
                                router.push("/dashboard");
                            }
                        }}
                        disabled={isDisabled}
                        className="rounded-full bg-[#2596BE] hover:bg-[#1A7A9E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-dm-sans text-sm px-8 py-3 transition-colors"
                    >
                        {step === 4 ? "Submit" : "Continue"}
                    </button>
                </div>
            </div>

        </div>
    );
}