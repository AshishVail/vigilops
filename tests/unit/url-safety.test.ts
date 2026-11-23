import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/network/dns", () => ({
  resolveHostname: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]),
}));
import { isPrivateAddress, validateSafeUrl } from "@/lib/network/url-safety";

describe("SSR-safe URL protection", () => {
  it("detects private and reserved IPv4 addresses", () => {
    expect(isPrivateAddress("127.0.0.1")).toBe(true);
    expect(isPrivateAddress("10.0.0.5")).toBe(true);
    expect(isPrivateAddress("192.168.1.8")).toBe(true);
    expect(isPrivateAddress("169.254.169.254")).toBe(true);
  });

  it("detects loopback IPv6", () => {
    expect(isPrivateAddress("::1")).toBe(true);
    expect(isPrivateAddress("fc00::1")).toBe(true);
  });

  it("rejects non-http schemes", async () => {
    await expect(validateSafeUrl("file:///etc/passwd")).rejects.toThrow();
  });

  it("allows public HTTPS targets", async () => {
    await expect(validateSafeUrl("https://example.com")).resolves.toBeInstanceOf(URL);
  });
});
