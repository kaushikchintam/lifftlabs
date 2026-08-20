import type { FinanceStage } from "./pot-configs";

export interface Discount {
  slug: string;
  title: string;
  description: string;
}

// The med student list is the only one that's actually been designed —
// applicant's mockup reused it verbatim, so it's shared here too.
// Resident ships empty: "student railcard" etc. don't apply to a working
// doctor, and no real resident content has been provided yet.
const MED_STUDENT_DISCOUNTS: Discount[] = [
  {
    slug: "council-tax",
    title: "Council tax exemption",
    description: "All-student household pays none; living with one non-student they count as single occupant — 25% off",
  },
  {
    slug: "blue-light",
    title: "Blue Light + student discount",
    description: "Med students qualify for Blue Light Card alongside the usual student schemes",
  },
  {
    slug: "dbs-update",
    title: "DBS update service",
    description: "Free ongoing DBS if you register while volunteering — saves re-checks",
  },
  {
    slug: "railcard",
    title: "Student railcard",
    description: "No upper age limit as a full-time student, even past 30 — links to Oyster for tube discounts too",
  },
];

export const DISCOUNTS: Record<FinanceStage, Discount[]> = {
  applicant: MED_STUDENT_DISCOUNTS,
  med_student: MED_STUDENT_DISCOUNTS,
  resident: [],
};
