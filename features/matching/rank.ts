import { KINDS, tagLabel } from "@/features/journeys/config";

export interface Candidate {
  userId: string;
  name: string;
  kind: string;
  tags: string[];
  /** ISO start times of open slots, ascending. */
  slots: string[];
}

export interface Ranked extends Candidate {
  shared: string[];
  reason: string | null;
}

export const MAX_MATCHES = 3;

/**
 * Rule-based matching: drop kinds the learner didn't ask for (a personal
 * trainer only with "personal_training"), drop mentors with no slot, then
 * rank by shared tags, then soonest slot. `requireShared` is for the
 * cross-journey topic journey, where an untagged mentor is no match at all.
 * `all` is the Mentors tab: everyone (personal trainers too), no cap,
 * mentors with no open times last.
 */
export function rankMentors(
  candidates: Candidate[],
  learnerTags: string[],
  { requireShared = false, all = false }: { requireShared?: boolean; all?: boolean } = {}
): Ranked[] {
  const wanted = new Set(learnerTags);

  return candidates
    .filter((c) => all || c.slots.length > 0)
    .filter((c) => {
      const gate = KINDS[c.kind]?.onlyWithTag;
      return all || !gate || wanted.has(gate);
    })
    .map((c) => {
      const shared = c.tags.filter((t) => wanted.has(t));
      const prefix = KINDS[c.kind]?.reason ?? KINDS.mentor.reason;
      return {
        ...c,
        shared,
        reason: shared.length ? `${prefix}: ${shared.map(tagLabel).join(", ")}.` : null,
      };
    })
    .filter((c) => !requireShared || c.shared.length > 0)
    .sort(
      // mentors without times go last
      (a, b) =>
        b.shared.length - a.shared.length ||
        Number(!a.slots.length) - Number(!b.slots.length) ||
        (a.slots[0] ?? "").localeCompare(b.slots[0] ?? "")
    )
    .slice(0, all ? undefined : MAX_MATCHES);
}
