export type FinanceStage = "applicant" | "med_student" | "resident";

export interface PotTargetCost {
  label: string;
  amountRange: string;
}

export interface PotConfig {
  potName: string;
  goalPence: number;
  targetCosts: PotTargetCost[];
  note: string;
}

export const POT_CONFIGS: Record<FinanceStage, PotConfig> = {
  applicant: {
    potName: "Getting-in fund",
    goalPence: 450000,
    targetCosts: [
      { label: "UCAT / GAMSAT sittings", amountRange: "£70–520" },
      { label: "UCAS + interview travel", amountRange: "~£450" },
      { label: "First-term kit & deposit", amountRange: "~£1,200" },
    ],
    note: "Covers year-one costs you can't defer: tests, applications, interview travel, first-term kit. Separate from your runway savings.",
  },
  med_student: {
    potName: "Placement & elective fund",
    goalPence: 320000,
    targetCosts: [
      { label: "Elective flights & accommodation", amountRange: "£1,500–2,500" },
      { label: "Placement travel before reimbursement", amountRange: "£40–90/mo" },
      { label: "Finals resources & kit", amountRange: "~£400" },
    ],
    note: "Bursaries and the NHS Learning Support Fund cover some of this and reimburse late. The pot is what bridges the gap while you wait.",
  },
  resident: {
    potName: "Portfolio & exam fund",
    goalPence: 580000,
    targetCosts: [
      { label: "MRCP / MRCS part exams", amountRange: "£460–650 each" },
      { label: "Courses & conferences (scored)", amountRange: "£800–2,000" },
      { label: "GMC, indemnity & royal college fees", amountRange: "~£900/yr" },
    ],
    note: "Study budget rarely covers a full year. Courses and exams are the biggest points-per-pound items on the person spec, so they're worth funding deliberately.",
  },
};
