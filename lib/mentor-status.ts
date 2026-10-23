/** Applied → Approved → Hours → Live, derived — never stored.
 *  ponytail: payouts aren't a go-live step until Stripe Connect is verified; booking itself still needs charges_enabled. */
export const MENTOR_STEPS = ["Applied", "Approved", "Hours", "Live"] as const;

export interface MentorStatusInput {
  hasProfile: boolean;
  hoursCount: number;
  paused: boolean;
}

/** Index of the last completed step (0 = Applied … 3 = Live). */
export function mentorStep(m: MentorStatusInput): number {
  if (!m.hasProfile) return 0;
  if (m.hoursCount === 0) return 1;
  return m.paused ? 2 : 3;
}

export function mentorStatusLabel(m: MentorStatusInput): "Applied" | "Approved" | "Live" | "Paused" {
  if (!m.hasProfile) return "Applied";
  if (m.paused && m.hoursCount > 0) return "Paused";
  return mentorStep(m) === 3 ? "Live" : "Approved";
}
