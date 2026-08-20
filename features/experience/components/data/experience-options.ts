//Shared option lists (types, frequency units) so the buttons and the enum values can't drift apart

export type ExperienceKind =
  | "shadowing"
  | "volunteering"
  | "observation"
  | "paid_care_work"
  | "virtual_course"
  | "other";

export type ExperienceSetting = "remote" | "in_person";
export type FrequencyUnit = "week" | "fortnight" | "month";

export const EXPERIENCE_KINDS: { value: ExperienceKind; label: string }[] = [
  { value: "shadowing", label: "Shadowing" },
  { value: "volunteering", label: "Volunteering" },
  { value: "observation", label: "Observation" },
  { value: "paid_care_work", label: "Paid care work" },
  { value: "virtual_course", label: "Virtual course" },
  { value: "other", label: "Other" },
];

export const SETTINGS: { value: ExperienceSetting; label: string }[] = [
  { value: "in_person", label: "In person" },
  { value: "remote", label: "Remote" },
];

export const FREQUENCY_UNITS: { value: FrequencyUnit; label: string }[] = [
  { value: "week", label: "week" },
  { value: "fortnight", label: "fortnight" },
  { value: "month", label: "month" },
];

export const EXPERIENCE_KIND_LABELS = Object.fromEntries(
  EXPERIENCE_KINDS.map((k) => [k.value, k.label])
) as Record<ExperienceKind, string>;
