export type PortfolioCategory =
  | "research"
  | "teaching"
  | "leadership"
  | "commitment_to_specialty";

export const PORTFOLIO_CATEGORIES: {
    value: PortfolioCategory;
    label: string;
    icon: string; // lucide-react name
}[] = [
    { value: "research", label: "Research", icon: "FlaskConical" },
    { value: "teaching", label: "Teaching", icon: "GraduationCap" },
    { value: "leadership", label: "Leadership", icon: "Flag" },
    { value: "commitment_to_specialty", label: "Commitment to specialty", icon: "Compass" },
];

export const PORTFOLIO_TYPES: Record<PortfolioCategory, { value: string; label: string }[]> = {
    research: [
        { value: "oral_presentation", label: "Oral presentation" },
        { value: "poster_presentation", label: "Poster presentation" },
        { value: "abstract", label: "Abstract" },
        { value: "publication", label: "Publication" },
    ],
    teaching: [
        { value: "peer_teaching_session", label: "Peer teaching session" },
        { value: "osce_tutor", label: "OSCE tutor" },
        { value: "formal_lecture", label: "Formal lecture" },
        { value: "simulation_facilitator", label: "Simulation facilitator" },
    ],
    leadership: [
        { value: "audit", label: "Audit" },
        { value: "quality_improvement", label: "Quality improvement" },
        { value: "society_leadership", label: "Society leadership" },
        { value: "student_doctor_rep", label: "Student/doctor rep" },
    ],
    commitment_to_specialty: [
        { value: "taster_week", label: "Taster week" },
        { value: "shadowing", label: "Shadowing" },
        { value: "conference_attendance", label: "Conference attendance" },
        { value: "society_membership", label: "Society membership" },
        { value: "commitment_role", label: "Commitment role" },
    ],
};
