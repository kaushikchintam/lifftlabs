import type { FinanceStage } from "./pot-configs";

export interface FundingScheme {
  slug: string;
  name: string;
  typicalAmountPence: number;
  description: string;
  eligibility: string;
  timing: string;
  tip: string;
}

export const FUNDING_SCHEMES: Record<FinanceStage, FundingScheme[]> = {
  applicant: [
    {
      slug: "ucat-bursary",
      name: "UCAT Bursary",
      typicalAmountPence: 7000,
      description: "Covers the full test fee, and travel to the test centre",
      eligibility: "On means-tested benefits, free school meals, or a 16–19 bursary in the last 3 years",
      timing: "Apply before you book — bursary code needed at booking",
      tip: "Most eligible applicants never apply because they book the test first.",
    },
    {
      slug: "interview-travel",
      name: "Interview travel reimbursement",
      typicalAmountPence: 18000,
      description: "Train fare and sometimes a night's accommodation",
      eligibility: "Widening-participation flagged applicants at most schools — ask admissions directly",
      timing: "Claim within 30 days of the interview",
      tip: "Rarely advertised. It's an email to the admissions office.",
    },
    {
      slug: "med-school-access-bursary",
      name: "Medical school access bursary",
      typicalAmountPence: 100000,
      description: "Non-repayable annual bursary, paid termly",
      eligibility: "Household income thresholds vary by school — typically under £35k",
      timing: "Apply after you accept an offer, before term starts",
      tip: "Separate from Student Finance. You have to apply for it yourself.",
    },
    {
      slug: "ucas-fee-waiver",
      name: "UCAS application fee",
      typicalAmountPence: 2900,
      description: "Fee waiver",
      eligibility: "Some schools and colleges cover it for their own students",
      timing: "At the point of applying",
      tip: "Small, but it's the first cost people meet.",
    },
  ],
  med_student: [
    {
      slug: "nhs-lsf-travel",
      name: "NHS Learning Support Fund — travel (TDAE)",
      typicalAmountPence: 62000,
      description: "Placement travel above your normal term-time commute, plus dual accommodation",
      eligibility: "All eligible medical students on clinical placement",
      timing: "Claim per placement, within 6 months — miss it and it's gone",
      tip: "The single most underclaimed thing at this stage. It's a form per placement, not a means test.",
    },
    {
      slug: "nhs-bursary-med-student",
      name: "NHS Bursary",
      typicalAmountPence: 100000,
      description: "Non-means-tested grant plus means-tested bursary",
      eligibility: "Year 5 onwards on standard entry; year 2 onwards on graduate entry",
      timing: "Reapply every academic year",
      tip: "Doesn't roll over automatically — a missed reapplication is a missed year.",
    },
    {
      slug: "elective-grants",
      name: "Elective grants",
      typicalAmountPence: 70000,
      description: "Flights and accommodation toward your elective",
      eligibility: "Royal colleges, the BMA, your medical school's own elective fund — you can hold several",
      timing: "Deadlines fall 6–12 months before the elective",
      tip: "Applications are short essays. Applying to four is a normal afternoon's work.",
    },
    {
      slug: "university-hardship-fund",
      name: "University hardship fund",
      typicalAmountPence: 50000,
      description: "Discretionary non-repayable grant",
      eligibility: "Unexpected costs or a shortfall you can document",
      timing: "Any time, but decisions take 4–6 weeks",
      tip: "Not a last resort — it's a budget line the university has to spend.",
    },
  ],
  resident: [
    {
      slug: "tax-relief-professional-fees",
      name: "Tax relief on professional fees",
      typicalAmountPence: 46000,
      description: "20–40% back on GMC, royal college, BMA and indemnity fees — backdatable 4 years",
      eligibility: "Any doctor paying these fees themselves",
      timing: "Any time, via HMRC form P87. Backdating closes 4 years after each tax year",
      tip: "The clearest money-for-nothing on this list, and most residents have never filed it.",
    },
    {
      slug: "study-budget",
      name: "Study budget",
      typicalAmountPence: 80000,
      description: "Courses, conferences and some exam fees",
      eligibility: "Every trainee, via your deanery or trust study leave team",
      timing: "Use it within the training year — it does not carry over",
      tip: "Unspent budget is returned, not banked. Claim early in the year before it's committed.",
    },
    {
      slug: "trust-charitable-education-funds",
      name: "Trust charitable / education funds",
      typicalAmountPence: 50000,
      description: "Course and conference costs the study budget won't stretch to",
      eligibility: "Staff at most trusts — ask the education centre, not payroll",
      timing: "Rolling, often quarterly panels",
      tip: "Separate pot from study leave. Frequently undersubscribed.",
    },
    {
      slug: "relocation-excess-mileage",
      name: "Relocation & excess mileage",
      typicalAmountPence: 90000,
      description: "Removal costs or mileage when a rotation moves you",
      eligibility: "Trainees required to relocate or commute further by rotation allocation",
      timing: "Claim within 3 months of the rotation change",
      tip: "Rotation-driven moves are reimbursable. Voluntary ones aren't.",
    },
  ],
};
