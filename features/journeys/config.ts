import { GraduationCap, HeartPulse, Lightbulb, Coins, type LucideIcon } from "lucide-react";

/**
 * The four journeys. Questions → options → tags drive the intake form, the
 * "We'll match you on" strip, the mentor application's topic chips, and
 * matching. Code, not DB: four journeys, no admin editing.
 */

export type JourneySlug = "medical-school" | "wellbeing" | "specific-topic" | "finances";

export interface Option {
  label: string;
  tags: string[];
}

export interface Question {
  id: string;
  label: string;
  multi?: boolean;
  options: Option[];
}

export interface Journey {
  slug: JourneySlug;
  title: string;
  cardLabel: string;
  heading: string;
  subheading?: string;
  icon: LucideIcon;
  accent: { light: string; dark: string };
  questions: Question[];
  /** Match on tags across every live mentor, ignoring mentor.journeys. */
  matchAcrossJourneys?: boolean;
}

export const JOURNEYS: Journey[] = [
  {
    slug: "medical-school",
    title: "Getting into medical school",
    cardLabel: "I want to get into medical school",
    heading: "Tell us a little about where you are",
    icon: GraduationCap,
    accent: { light: "#D9F2E5", dark: "#197550" },
    questions: [
      {
        id: "now",
        label: "Where are you right now?",
        options: [
          { label: "At university", tags: ["applying_from_university"] },
          { label: "Graduate", tags: ["graduate_entry"] },
          { label: "Career changer", tags: ["graduate_entry", "career_change"] },
          { label: "Retrainer", tags: ["graduate_entry", "career_change"] },
        ],
      },
      {
        id: "test",
        label: "Admissions test",
        options: [
          { label: "UCAT", tags: ["ucat"] },
          { label: "GAMSAT", tags: ["gamsat"] },
          { label: "Not sure yet", tags: ["choosing_a_test"] },
        ],
      },
      {
        id: "help",
        label: "What would help most?",
        multi: true,
        options: [
          { label: "Personal statement", tags: ["personal_statements"] },
          { label: "Interviews", tags: ["interviews"] },
          { label: "Choosing schools", tags: ["choosing_schools"] },
          { label: "Funding", tags: ["funding"] },
        ],
      },
    ],
  },
  {
    slug: "wellbeing",
    title: "Wellbeing & burnout",
    cardLabel: "I work in healthcare and feel burnt out",
    heading: "Tell us a little about where you are",
    icon: HeartPulse,
    accent: { light: "#F0E1F6", dark: "#833BAC" },
    questions: [
      {
        id: "role",
        label: "Your role",
        options: [
          { label: "Doctor", tags: ["doctors"] },
          { label: "Nurse or midwife", tags: ["nurses_midwives"] },
          { label: "Allied health", tags: ["allied_health"] },
          { label: "Other healthcare role", tags: [] },
        ],
      },
      {
        id: "hardest",
        label: "What feels hardest right now?",
        options: [
          { label: "Nights and rota", tags: ["nights_rotas"] },
          { label: "Thinking about leaving", tags: ["thinking_about_leaving"] },
          { label: "Currently off work", tags: ["time_off_work"] },
          { label: "Running on empty", tags: ["exhaustion"] },
        ],
      },
      {
        id: "trainer",
        label: "Would you also like support from a personal trainer?",
        options: [
          { label: "Yes, connect me", tags: ["personal_training"] },
          { label: "Maybe later", tags: [] },
          { label: "No thanks", tags: [] },
        ],
      },
    ],
  },
  {
    slug: "specific-topic",
    title: "Help with a specific topic",
    cardLabel: "I need help with a specific topic",
    heading: "What do you need help with?",
    subheading: "Pick one topic.",
    icon: Lightbulb,
    accent: { light: "#DFE8F9", dark: "#395DBD" },
    matchAcrossJourneys: true,
    questions: [
      {
        id: "topic",
        label: "Topic",
        options: [
          { label: "Specialty applications", tags: ["specialty_applications"] },
          { label: "Portfolio & ARCP", tags: ["portfolios"] },
          { label: "Research & publishing", tags: ["research_audit"] },
          { label: "Postgraduate exams", tags: ["exams"] },
          { label: "Fertility & family planning", tags: ["fertility_family_planning"] },
          { label: "Less than full time training", tags: ["less_than_full_time"] },
          { label: "Leadership & management", tags: ["leadership"] },
        ],
      },
      {
        id: "stage",
        label: "Your stage",
        options: [
          { label: "Foundation", tags: ["foundation_doctors"] },
          { label: "Core or specialty training", tags: ["trainees"] },
          { label: "SAS or locally employed", tags: ["sas_doctors"] },
          { label: "Consultant or GP", tags: ["senior_clinicians"] },
        ],
      },
    ],
  },
  {
    // ponytail: questions inferred from the admin waitlist screen ("Locum and self-employed tax · Doctor") — confirm wording
    slug: "finances",
    title: "Managing my finances",
    cardLabel: "I'm a healthcare professional and want to manage my finances better",
    heading: "Tell us a little about where you are",
    icon: Coins,
    accent: { light: "#F8EBB1", dark: "#755D1B" },
    questions: [
      {
        id: "need",
        label: "What do you need help with?",
        options: [
          { label: "Locum and self-employed tax", tags: ["locum_tax"] },
          { label: "NHS pension", tags: ["nhs_pension"] },
          { label: "Student loans", tags: ["student_loans"] },
          { label: "Budgeting", tags: ["budgeting"] },
        ],
      },
      {
        id: "role",
        label: "Your role",
        options: [
          { label: "Doctor", tags: ["doctors"] },
          { label: "Nurse or midwife", tags: ["nurses_midwives"] },
          { label: "Allied health", tags: ["allied_health"] },
          { label: "Other healthcare role", tags: [] },
        ],
      },
    ],
  },
];

export const TAG_LABELS: Record<string, string> = {
  applying_from_university: "applying from university",
  graduate_entry: "graduate entry",
  career_change: "career change into medicine",
  ucat: "UCAT",
  gamsat: "GAMSAT",
  choosing_a_test: "choosing a test",
  personal_statements: "personal statements",
  interviews: "interviews",
  choosing_schools: "choosing schools",
  funding: "funding",
  doctors: "doctors",
  nurses_midwives: "nurses & midwives",
  allied_health: "allied health",
  nights_rotas: "nights & rotas",
  thinking_about_leaving: "thinking about leaving",
  time_off_work: "time off work",
  exhaustion: "exhaustion",
  personal_training: "personal training",
  specialty_applications: "specialty applications",
  portfolios: "portfolios",
  research_audit: "research & audit",
  exams: "exams",
  fertility_family_planning: "fertility & family planning",
  less_than_full_time: "less than full time",
  leadership: "leadership",
  foundation_doctors: "foundation doctors",
  trainees: "trainees",
  sas_doctors: "SAS doctors",
  senior_clinicians: "senior clinicians",
  locum_tax: "locum tax",
  nhs_pension: "NHS pension",
  student_loans: "student loans",
  budgeting: "budgeting",
};

/** Mentor kinds. A kind with `onlyWithTag` is shown only when the learner
 *  picked that tag (a personal trainer only for "Yes, connect me"). */
export const KINDS: Record<string, { label: string; onlyWithTag?: string; reason: string }> = {
  mentor: { label: "Mentor", reason: "Has been exactly where you are" },
  personal_trainer: { label: "Personal trainer", onlyWithTag: "personal_training", reason: "Works with" },
  coach: { label: "Coach", reason: "Works with" },
  tutor: { label: "Tutor", reason: "Works with" },
  specialist: { label: "Specialist", reason: "Works with" },
};

export const SESSION_MINUTES = 60;
export const PLATFORM_FEE_PERCENT = 20;
/** LIFFT Plus: £9/month (must match the Stripe price in STRIPE_PRICE_ID). Members
 *  get this % off sessions, paid out of LIFFT's fee, never the mentor's share. */
export const PLUS_MONTHLY_PENCE = 900;
export const PLUS_DISCOUNT_PERCENT = 10;

/** What a session costs and who gets what. The member discount comes out of
 *  LIFFT's fee, so the mentor's share is the same either way. */
export function sessionPricing(pricePence: number, member: boolean) {
  const fee = Math.round((pricePence * PLATFORM_FEE_PERCENT) / 100);
  const discount = member ? Math.round((pricePence * PLUS_DISCOUNT_PERCENT) / 100) : 0;
  return { amount: pricePence - discount, fee: fee - discount, mentorShare: pricePence - fee };
}

/** Mentor price bounds, in pounds. */
export const MIN_PRICE = 20;
export const MAX_PRICE = 300;

export function getJourney(slug: string): Journey | undefined {
  return JOURNEYS.find((j) => j.slug === slug);
}

export function tagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.replace(/_/g, " ");
}

/** Every tag a journey can produce — the mentor form's topic chips. */
export function journeyTags(journey: Journey): string[] {
  return [...new Set(journey.questions.flatMap((q) => q.options.flatMap((o) => o.tags)))];
}

/** Topics = tags of the selected journeys, so mentor forms and the intake never drift. */
export function topicsFor(journeys: string[]): string[] {
  return [...new Set(JOURNEYS.filter((j) => journeys.includes(j.slug)).flatMap(journeyTags))];
}

/** Answers are option indices per question id. */
export type Answers = Record<string, number[]>;

/** URL ⇄ answers: `?now=1&help=0,2`. Unknown ids/indices are dropped. */
export function answersFromParams(
  journey: Journey,
  params: Record<string, string | string[] | undefined>
): Answers {
  const answers: Answers = {};
  for (const q of journey.questions) {
    const raw = params[q.id];
    if (typeof raw !== "string" || raw === "") continue;
    const picked = raw
      .split(",")
      .map(Number)
      .filter((i) => Number.isInteger(i) && i >= 0 && i < q.options.length);
    if (picked.length) answers[q.id] = q.multi ? [...new Set(picked)] : [picked[0]];
  }
  return answers;
}

/** Untrusted answers from a request body → only valid ids/indices. */
export function sanitizeAnswers(journey: Journey, raw: Record<string, number[]>): Answers {
  return answersFromParams(
    journey,
    Object.fromEntries(Object.entries(raw).map(([id, idx]) => [id, idx.join(",")]))
  );
}

export function answersToQuery(answers: Answers): string {
  return new URLSearchParams(
    Object.entries(answers).map(([id, idx]) => [id, idx.join(",")])
  ).toString();
}

export function isComplete(journey: Journey, answers: Answers): boolean {
  return journey.questions.every((q) => (answers[q.id]?.length ?? 0) > 0);
}

export function tagsFor(journey: Journey, answers: Answers): string[] {
  return [
    ...new Set(
      journey.questions.flatMap((q) => (answers[q.id] ?? []).flatMap((i) => q.options[i].tags))
    ),
  ];
}

/** {questionId: [option labels]} — what intakes.answers stores. */
export function answerLabels(journey: Journey, answers: Answers): Record<string, string[]> {
  return Object.fromEntries(
    journey.questions
      .filter((q) => answers[q.id]?.length)
      .map((q) => [q.id, answers[q.id].map((i) => q.options[i].label)])
  );
}

/** Saved labels back to indices — "Book again" reuses the intake. */
export function answersFromLabels(journey: Journey, labels: Record<string, string[]>): Answers {
  const answers: Answers = {};
  for (const q of journey.questions) {
    const idx = (labels[q.id] ?? [])
      .map((l) => q.options.findIndex((o) => o.label === l))
      .filter((i) => i >= 0);
    if (idx.length) answers[q.id] = idx;
  }
  return answers;
}

/** For display: question label + answer, in question order. */
export function describeAnswers(
  journey: Journey,
  labels: Record<string, string[]>
): { id: string; question: string; answer: string }[] {
  return journey.questions
    .filter((q) => labels[q.id]?.length)
    .map((q) => ({ id: q.id, question: q.label, answer: labels[q.id].join(", ") }));
}
