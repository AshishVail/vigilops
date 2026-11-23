import { describe, expect, it } from "vitest";
import { calculateSecurityScore } from "@/lib/security/scoring";
import type { HeaderCheck } from "@/lib/security/headers";

describe("security scoring", () => {
  it("grades a fully hardened target", () => {
    const headers: HeaderCheck[] = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "referrer-policy",
      "permissions-policy",
      "cross-origin-opener-policy",
    ].map((name) => ({
      name,
      present: true,
      value: "configured",
      status: "pass",
      description: "Configured",
    }));
    const result = calculateSecurityScore(headers, {
      valid: true,
      expiringSoon: false,
      issuerPresent: true,
      protocolModern: true,
      redirectEnforced: true,
      status: "pass",
      description: "Valid",
    });
    expect(result.score).toBe(100);
    expect(result.grade).toBe("A+");
  });

  it("returns a low score for missing security", () => {
    const result = calculateSecurityScore([], {
      valid: false,
      expiringSoon: false,
      issuerPresent: false,
      protocolModern: false,
      redirectEnforced: false,
      status: "fail",
      description: "Invalid",
    });
    expect(result.score).toBeLessThan(50);
    expect(result.grade).toBe("F");
  });
});
