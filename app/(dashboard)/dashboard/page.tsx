import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ChevronRight, Zap, Video, MessageCircle } from "lucide-react";

const MOCK = {
  tag: "Graduate Entry 2026",
  milestone: {
    title: "GAMSAT – September sitting",
    daysAway: 36,
    examReadiness: 62,
  },
  stats: {
    pathway: { value: "34%", sub: "6 stages · on track" },
    exam: { value: "62%", sub: "38 days to GAMSAT" },
    application: { value: "Draft 2", sub: "2 mentor notes to action" },
  },
  focus: [
    { type: "task", title: "Adaptive set · 12 questions", sub: "Focused on Physics & Organic chemistry" },
    { type: "session", title: "Session with Rachel · today 3:00pm", sub: "Review personal statement, draft 2" },
  ],
  cohort: {
    count: 248,
    avatars: ["TW", "NR", "OA"],
    quote: "Just got back my S3 mock — physics finally clicked after the adaptive set hammered m...",
  },
};

export default async function DashboardPage() {
    const session = await auth.api.getSession({headers: await headers() });
    const firstName = session?.user.name?.split(" ")[0] ?? "there";

    const { data: profile } = await supabaseAdmin
        .from("learner_profiles")
        .select("current_position, target_role")
        .eq("user_id", session?.user.id ?? "")
        .maybeSingle();
        
        const subtitle = 
        profile?.current_position && profile?.target_role
        ? `${profile.current_position} → ${profile.target_role}. Here's where you are.`
        :"Here's where you are.";

    return (
        <div className="p-10">
            {/*Header*/}
            <div className="mb-8">
                <span className="inline-block font-dm-sans text-xs text-[#6F6B60] border border-[#E8E2D6] rounded-full px-3 py-1 mb-4">
                    {MOCK.tag}
                </span>
                <h2 className="font-archivo-black text-5xl text-[#18150F] mb-2">Hello, {firstName}</h2>
                <p className="font-dm-sans text-lg text-[#6F6B60]">{subtitle}</p>
            </div>
            {/*Next milestone*/}
            <div className="bg-[#dceaf3] rounded-2xl px-8 py-6 flex items-center justify-between mb-6">
                <div>
                    <p className="font-dm-sans text-xs text-[#6F6B60] mb-2">Your next milestone</p>
                    <h2 className="font-archivo-black text-2xl text-[#18150F] mb-1">{MOCK.milestone.title}</h2>
                    <p className="font-dm-sans text-sm text-[#6F6B60]">
                        {MOCK.milestone.daysAway} days away . exam readiness {MOCK.milestone.examReadiness}%
                    </p>
                </div>
                <button className="bg-[#18150F] text-white font-dm-sans text-sm px-5 py-2.5 rounded-full hover:bg-[#2d2a22] transition-colors flex-shrink-0">
                    Continue prep
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Pathway", ...MOCK.stats.pathway },
                    { label: "Exam readiness", ...MOCK.stats.exam },
                    { label: "Application", ...MOCK.stats.application },
                ].map(({ label, value, sub }) => (
          <div key={label} className="border border-[#E8E2D6] rounded-xl p-5">
            <p className="font-dm-sans text-xs text-[#6F6B60] mb-2">{label}</p>
            <p className="font-archivo-black text-3xl text-[#18150F] mb-1">{value}</p>
            <p className="font-dm-sans text-xs text-[#6F6B60]">{sub}</p>
          </div>
        ))}
            </div>

            {/*Bottom 2 cols */}
            <div className="grid grid-cols-2 gap-4">
                {/* Today's focus */}
                <div className="border border-[#E8E2D6] rounded-xl p-6">
                    <p className="font-dm-sans text-xs text-[#6F6B60] mb-4">Today's focus</p>
                    <div className="flex flex-col gap-2 mb-5">
                        {MOCK.focus.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#FBF7EE] transition-colors cursor-pointer">
                                <div className="w-7 h-7 rounded-full bg-[#E8E2D6] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {item.type === "task" ? <Zap size={13} /> : <Video size={13} />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-dm-sans text-sm text-[#18150F]">{item.title}</p>
                                    <p className="font-dm-sans text-xs text-[#6F6B60]">{item.sub}</p>
                                </div>
                                <ChevronRight size={14} className="text-[#6F6B60] mt-1 flex-shrink-0" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 border border-[#E8E2D6] rounded-full px-4 py-2 font-dm-sans text-sm text-[#18150F] hover:bg-[#FBF7EE] transition-colors">
                            <MessageCircle size={14} /> Message
                        </button>
                        <button className="flex items-center gap-2 bg-[#2596BE] text-white rounded-full px-4 py-2 font-dm-sans text-sm hover:bg-[#1A7A9E] transition-colors">
                            <Video size={14} /> Join call
                        </button>
                    </div>
                </div>

                {/* From your cohort */}
                <div className="border border-[#E8E2D6] rounded-xl p-6 flex flex-col">
                    <p className="font-dm-sans text-xs text-[#6F6B60] mb-1">From your cohort</p>
                    <p className="font-dm-sans text-sm text-[#18150F] mb-3">{MOCK.cohort.count} career-changers, same year</p>
                    <div className="flex gap-1.5 mb-4">
                        {MOCK.cohort.avatars.map((initials) => (
                            <div key={initials} className="w-8 h-8 rounded-full bg-[#18150F] flex items-center justify-center">
                                <span className="font-dm-sans text-white text-xs">{initials}</span>
                            </div>
                        ))}
                    </div>
                    <p className="font-dm-sans text-sm text-[#6F6B60] italic mb-5 flex-1">"{MOCK.cohort.quote}"</p>
                    <button className="w-full bg-[#2596BE] text-white font-dm-sans text-sm py-2.5 rounded-full hover:bg-[#1A7A9E] transition-colors">
                        Open community
                    </button>
                </div>
            </div>
        </div>
    )
}