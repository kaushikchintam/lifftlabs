import { describe, expect, it } from "vitest";
import { rankMentors, type Candidate } from "./rank";

const c = (userId: string, kind: string, tags: string[], first: string | null): Candidate => ({
  userId,
  name: userId,
  kind,
  tags,
  slots: first ? [first] : [],
});

describe("rankMentors", () => {
  const sam = c("sam", "mentor", ["doctors", "thinking_about_leaving"], "2026-10-23T12:00:00Z");
  const jordan = c("jordan", "personal_trainer", ["nurses_midwives", "personal_training"], "2026-10-17T09:00:00Z");
  const rachel = c("rachel", "mentor", ["thinking_about_leaving"], "2026-10-19T19:00:00Z");
  const noSlots = c("ghost", "mentor", ["doctors", "thinking_about_leaving"], null);

  it("ranks by shared tags, then soonest slot, and drops mentors without slots", () => {
    const ranked = rankMentors([rachel, sam, noSlots], ["doctors", "thinking_about_leaving"]);
    expect(ranked.map((r) => r.userId)).toEqual(["sam", "rachel"]);
    expect(ranked[0].reason).toBe("Has been exactly where you are: doctors, thinking about leaving.");
  });

  it("only shows a personal trainer when the learner asked for one", () => {
    expect(rankMentors([jordan], ["nurses_midwives"])).toEqual([]);
    const ranked = rankMentors([jordan], ["nurses_midwives", "personal_training"]);
    expect(ranked[0].reason).toBe("Works with: nurses & midwives, personal training.");
  });

  it("requireShared drops untagged matches", () => {
    expect(rankMentors([rachel], ["exams"], { requireShared: true })).toEqual([]);
    expect(rankMentors([rachel], ["exams"])).toHaveLength(1);
  });

  it("all: keeps everyone, trainers and no-slot mentors too, sharers first", () => {
    const ranked = rankMentors([noSlots, jordan, rachel, sam], ["doctors"], { all: true });
    expect(ranked.map((r) => r.userId)).toEqual(["sam", "ghost", "jordan", "rachel"]);
  });
});
