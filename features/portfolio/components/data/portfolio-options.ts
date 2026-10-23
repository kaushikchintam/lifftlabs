// Applicant portfolio (medical-school journey): the four areas medical schools look for.
// The DB enum still holds the old med-student/resident values; they're unused.
export type PortfolioCategory = "work_experience" | "volunteering_caring" | "academic" | "leadership";

export const PORTFOLIO_CATEGORIES: {
  value: PortfolioCategory;
  label: string;
  icon: string; // lucide-react name
}[] = [
  { value: "work_experience", label: "Work experience", icon: "Briefcase" },
  { value: "volunteering_caring", label: "Volunteering & caring", icon: "HeartHandshake" },
  { value: "academic", label: "Academic & super-curricular", icon: "FlaskConical" },
  { value: "leadership", label: "Leadership & teamwork", icon: "Flag" },
];

export const PORTFOLIO_TYPES: Record<PortfolioCategory, { value: string; label: string }[]> = {
  work_experience: [
    { value: "placement", label: "Work experience placement" },
    { value: "shadowing", label: "Shadowing" },
    { value: "observation", label: "Hospital or GP observation" },
    { value: "paid_care_work", label: "Paid care work" },
  ],
  volunteering_caring: [
    { value: "care_home", label: "Care home volunteering" },
    { value: "hospice_charity", label: "Hospice or charity" },
    { value: "community", label: "Community volunteering" },
    { value: "young_carer", label: "Caring responsibilities" },
  ],
  academic: [
    { value: "epq", label: "EPQ" },
    { value: "summer_school", label: "Summer school" },
    { value: "online_course", label: "Online course" },
    { value: "competition", label: "Essay or science competition" },
    { value: "reading", label: "Reading & research" },
  ],
  leadership: [
    { value: "team_captain", label: "Team captain or sport" },
    { value: "student_rep", label: "Prefect or student council" },
    { value: "society_lead", label: "Society or club lead" },
    { value: "peer_mentoring", label: "Peer mentoring or tutoring" },
    { value: "part_time_job", label: "Part-time job" },
  ],
};

export const SCHOOL_STAGES = [
  { value: "considering", label: "Considering" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "unsuccessful", label: "Unsuccessful" },
] as const;
export type SchoolStage = (typeof SCHOOL_STAGES)[number]["value"];
