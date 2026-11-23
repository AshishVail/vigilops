import { describe, expect, it } from "vitest";

const rank = { investigating: 0, identified: 1, monitoring: 2, resolved: 3 };

describe("incident state transitions", () => {
  it("allows forward workflow transitions", () => {
    expect(rank.resolved).toBeGreaterThan(rank.investigating);
  });

  it("rejects backward transitions", () => {
    expect(rank.investigating < rank.resolved).toBe(true);
  });
});
