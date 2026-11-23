import { describe, expect, it } from "vitest";
import { observatoryRequestSchema } from "@/lib/validations/observatory";

describe("Observatory request validation", () => {
  it("accepts a valid HTTPS request", () => {
    const result = observatoryRequestSchema.safeParse({
      method: "POST",
      url: "https://example.com/api",
      queryParams: [{ key: "page", value: "1", enabled: true }],
      headers: { "Content-Type": "application/json" },
      auth: { type: "none" },
      body: { healthy: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported methods", () => {
    const result = observatoryRequestSchema.safeParse({
      method: "TRACE",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });
});
