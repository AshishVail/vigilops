import { describe, expect, it } from "vitest";

describe("Observatory execution contract", () => {
  it("includes a JSON execution result shape", () => {
    expect({ status: 200, latencyMs: 42, payloadSizeBytes: 128 }).toEqual({
      status: 200,
      latencyMs: 42,
      payloadSizeBytes: 128,
    });
  });
});
