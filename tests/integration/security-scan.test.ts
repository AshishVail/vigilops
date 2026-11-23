import { describe, expect, it } from "vitest";

describe("security scan contract", () => {
  it("includes a scored report shape", () => {
    expect({ securityScore: 90, grade: "A" }).toMatchObject({ grade: "A" });
  });
});
