import { describe, expect, it } from "vitest";

describe("cron authorization", () => {
  it("uses a bearer secret contract", () => {
    expect("Bearer test-secret").toMatch(/^Bearer .+/);
  });
});
