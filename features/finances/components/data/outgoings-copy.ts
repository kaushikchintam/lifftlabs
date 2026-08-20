import type { FinanceStage } from "./pot-configs";

export interface OutgoingsCopy {
  title: string;
  subtitle: string;
}

export const OUTGOINGS_COPY: Record<FinanceStage, OutgoingsCopy> = {
  // Applicant's mockup reused the med-student copy verbatim — same
  // leftover pattern as the discounts list.
  applicant: { title: "Outgoings as a med student", subtitle: "On top of the usual — budget these in before you start" },
  med_student: { title: "Outgoings as a med student", subtitle: "On top of the usual — budget these in before you start" },
  resident: { title: "Outgoings as a resident", subtitle: "On top of the usual — budget these in before you start" },
};
