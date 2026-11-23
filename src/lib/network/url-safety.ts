import "server-only";
import net from "node:net";
import { resolveHostname } from "@/lib/network/dns";

const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);

function normalizeIp(address: string) {
  return address.toLowerCase().replace(/^\[|\]$/g, "");
}

export function isPrivateAddress(address: string) {
  const normalized = normalizeIp(address);
  if (net.isIPv4(normalized)) {
    const octets = normalized.split(".").map(Number);
    const [a, b] = octets;
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a >= 224)
    );
  }
  if (net.isIPv6(normalized)) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("ff") ||
      normalized.startsWith("::ffff:127.") ||
      normalized.startsWith("::ffff:10.") ||
      normalized.startsWith("::ffff:192.168.") ||
      normalized.startsWith("::ffff:169.254.")
    );
  }
  return true;
}

export async function validateSafeUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }
  if (url.username || url.password) throw new Error("URLs containing credentials are not allowed");
  if (url.port && !["80", "443"].includes(url.port)) {
    throw new Error("Only standard HTTP and HTTPS ports are allowed");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error("Localhost targets are not allowed");
  }
  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    throw new Error("Private and reserved IP addresses are not allowed");
  }

  const addresses = await resolveHostname(hostname);
  if (addresses.length === 0) throw new Error("Hostname could not be resolved");
  if (addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error("Hostname resolves to a private or reserved address");
  }
  return url;
}
