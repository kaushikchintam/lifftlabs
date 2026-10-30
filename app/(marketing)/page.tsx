import { JourneyPicker } from "@/features/journeys/components/journey-picker";
import { getJourney, type JourneySlug } from "@/features/journeys/config";

// Decorative side cards. ponytail: no photos or ratings until there are real, consenting mentors to show.
const SIDE_CARDS: { title: string; journey: JourneySlug; topics: string; tilt: string }[] = [
  { title: "Chat with Retrainers", journey: "specific-topic", topics: "Start planning", tilt: "-rotate-3" },
  { title: "Medical school application mentor", journey: "medical-school", topics: "Applications · Interviews · UCAT", tilt: "rotate-2 ml-16" },
  { title: "Structured support built around your life", journey: "wellbeing", topics: "", tilt: "rotate-1" },
  { title: "Financial planning", journey: "finances", topics: "Funding options · Loans · Budgeting", tilt: "-rotate-2" },
  { title: "Career transition mentor", journey: "specific-topic", topics: "Make the change to medicine", tilt: "rotate-1 -ml-10" },
  { title: "Exam preparation tutor", journey: "medical-school", topics: "UCAT · GAMSAT · Interview practice", tilt: "rotate-3 ml-6" },
];

function SideCard({ card }: { card: (typeof SIDE_CARDS)[number] }) {
  const j = getJourney(card.journey)!;
  const Icon = j.icon;
  return (
    <div
      className={`relative w-[286px] rounded-[20px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${card.tilt}`}
      style={{ background: j.accent.light, color: j.accent.dark }}
    >
      <span aria-hidden className="absolute inset-2 rounded-[14px] border-2 border-dashed" style={{ borderColor: `${j.accent.dark}40` }} />
      <Icon size={22} strokeWidth={2} className="mb-3" />
      <p className="mb-1 text-[19px] font-bold leading-snug">{card.title}</p>
      {card.topics && <p className="text-[14px] opacity-80">{card.topics}</p>}
    </div>
  );
}

const STEPS = [
  ["Pick your journey", "Answer two or three questions about where you are."],
  ["Meet your match", "We show mentors who've been exactly where you are, with real open times."],
  ["Book and pay per session", "60 minutes on video. Your mentor reads your one-page brief first."],
];

export default function LandingPage() {
  return (
    <div className="bg-[#FEFEFE]">
      <section className="mx-auto grid max-w-[1440px] gap-9 px-4 pt-9 pb-14 md:px-[53px] xl:grid-cols-[1fr_minmax(0,770px)_1fr]">
        <div className="hidden flex-col gap-7 pt-2 xl:flex">
          {SIDE_CARDS.slice(0, 3).map((c) => <SideCard key={c.title} card={c} />)}
        </div>

        <div>
          <h1 className="mb-[18px] text-center text-4xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#0E1119] md:text-[53px]">
            Begin your retraining journey. 
          </h1>
          <p className="mx-auto mb-[26px] max-w-[660px] text-center text-base leading-relaxed text-[#283243] md:text-[19px]">
            From getting into medical school to navigating burnout, finances and find the right
            guidance for your next step.
          </p>
          <JourneyPicker />
        </div>

        <div className="hidden flex-col items-end gap-7 pt-2 xl:flex">
          {SIDE_CARDS.slice(3).map((c) => <SideCard key={c.title} card={c} />)}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-8 border-t border-lf-line bg-white px-4 py-20 md:px-12">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-10 text-4xl font-bold tracking-tight text-lf-ink">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map(([title, body], i) => (
              <div key={title} className="rounded-[20px] border-2 border-dashed border-lf-line p-7">
                <p className="mb-3 text-[28px] font-extrabold text-lf-ink">0{i + 1}</p>
                <p className="mb-2 text-[21px] font-medium text-lf-ink">{title}</p>
                <p className="text-[17px] text-lf-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
