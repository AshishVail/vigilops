import { describe, expect, it } from "vitest";
import { buildUptimeBars } from "@/lib/status/uptime-bars";

describe("public uptime bars", () => {
  it("creates the requested number of daily buckets", () => {
    const bars = buildUptimeBars([], 90);
    expect(bars).toHaveLength(90);
  });

  it("marks all-success days as operating", () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const bars = buildUptimeBars([
      { checked_at: now.toISOString(), status: "success" },
      { checked_at: now.toISOString(), status: "success" },
    ], 1);
    expect(bars[0].uptime).toBe(100);
    expect(bars[0].status).toBe("operating");
  });

  it("marks a failed day as down", () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const bars = buildUptimeBars([
      { checked_at: now.toISOString(), status: "failure" },
    ], 1);
    expect(bars[0].uptime).toBe(0);
    expect(bars[0].status).toBe("down");
  });
});
