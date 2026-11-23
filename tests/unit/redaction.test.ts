import { describe, expect, it } from "vitest";
import { redactSensitiveValue, redactJsonText } from "@/lib/ai/redaction";

describe("AI evidence redaction", () => {
  it("redacts sensitive object keys", () => {
    const result = redactSensitiveValue({
      authorization: "Bearer secret",
      api_key: "12345",
      status: 500,
    }) as Record<string, unknown>;
    expect(result.authorization).toBe("[REDACTED]");
    expect(result.api_key).toBe("[REDACTED]");
    expect(result.status).toBe(500);
  });

  it("redacts bearer, JWT, email, and IP values", () => {
    const text = 'Bearer abc123 eyJabc.def.ghi test@example.com 192.168.1.20';
    const result = redactJsonText(text);
    expect(result).not.toContain("abc123");
    expect(result).not.toContain("test@example.com");
    expect(result).not.toContain("192.168.1.20");
  });
});
