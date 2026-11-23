import { describe, expect, it } from "vitest";
import { parseDiagnosis } from "@/lib/ai/parsing";

describe("AI diagnosis integration", () => {
  it("parses strict JSON output", () => {
    const result = parseDiagnosis(JSON.stringify({
      rootCause: "The upstream database connection pool was exhausted.",
      severity: "high",
      recommendedFix: "Increase the pool size and monitor connection saturation.",
      confidence: 0.9,
      evidence: ["Connection pool utilization reached 100%"],
      likelyCauses: ["Pool exhaustion"],
      actionSteps: ["Raise pool limit", "Monitor saturation"],
    }));
    expect(result.severity).toBe("high");
  });
});
