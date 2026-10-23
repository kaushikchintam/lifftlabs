import { describe, expect, it } from "vitest";
import { sessionPricing } from "./config";

describe("sessionPricing", () => {
  it("non-member: full price, LIFFT keeps 20%", () => {
    expect(sessionPricing(4000, false)).toEqual({ amount: 4000, fee: 800, mentorShare: 3200 });
  });

  it("member: 10% off comes out of LIFFT's fee, mentor share unchanged", () => {
    const p = sessionPricing(4000, true);
    expect(p).toEqual({ amount: 3600, fee: 400, mentorShare: 3200 });
    expect(p.amount - p.fee).toBe(p.mentorShare); // what Stripe transfers to the mentor
  });
});
