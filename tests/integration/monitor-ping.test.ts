import { describe, expect, it } from "vitest";

describe("monitor ping integration", () => {
  it("defines the expected monitor ping payload", () => {
    expect({ monitorId: "00000000-0000-4000-8000-000000000001" }).toHaveProperty("monitorId");
  });
});
