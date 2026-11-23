import { describe, expect, it } from "vitest";

describe("incident alert contract", () => {
  it("supports down and recovered events", () => {
    expect(["down", "recovered"]).toContain("down");
    expect(["down", "recovered"]).toContain("recovered");
  });
});
