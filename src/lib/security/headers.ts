import "server-only";

export type HeaderCheck = {
  name: string;
  present: boolean;
  value: string | null;
  status: "pass" | "warning" | "fail";
  description: string;
};

const securityNames = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
] as const;

export function inspectSecurityHeaders(headers: Record<string, string>): HeaderCheck[] {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
  );

  return securityNames.map((name) => {
    const value = normalized[name] ?? null;
    let status: HeaderCheck["status"] = value ? "pass" : "fail";
    let description = "";

    if (name === "strict-transport-security") {
      if (!value) description = "HSTS is missing.";
      else {
        const maxAge = Number(value.match(/max-age=(\d+)/i)?.[1] ?? 0);
        status = maxAge >= 31536000 ? "pass" : "warning";
        description = status === "pass" ? "HSTS uses a strong one-year or longer policy." : "HSTS max-age is weaker than one year.";
      }
    } else if (name === "content-security-policy") {
      if (!value) description = "Content-Security-Policy is missing.";
      else {
        status = /(?:default-src\s+'none'|script-src)/i.test(value) ? "pass" : "warning";
        description = status === "pass" ? "A restrictive CSP policy is present." : "CSP exists but may allow unrestricted content.";
      }
    } else if (name === "x-frame-options") {
      if (!value) description = "Clickjacking protection header is missing.";
      else {
        status = /^(deny|sameorigin)$/i.test(value.trim()) ? "pass" : "warning";
        description = status === "pass" ? "Frame embedding is restricted." : "X-Frame-Options value is weak or unsupported.";
      }
    } else if (name === "x-content-type-options") {
      if (!value) description = "MIME-sniffing protection is missing.";
      else {
        status = value.trim().toLowerCase() === "nosniff" ? "pass" : "warning";
        description = status === "pass" ? "MIME sniffing is disabled." : "Expected value is nosniff.";
      }
    } else if (name === "referrer-policy") {
      if (!value) description = "Referrer-Policy is missing.";
      else {
        status = /strict-origin|no-referrer/i.test(value) ? "pass" : "warning";
        description = status === "pass" ? "Referrer disclosure is restricted." : "Consider a strict-origin or no-referrer policy.";
      }
    } else if (name === "permissions-policy") {
      if (!value) description = "Permissions-Policy is missing.";
      else {
        status = "pass";
        description = "Browser feature permissions are explicitly controlled.";
      }
    } else {
      if (!value) description = "Cross-Origin-Opener-Policy is missing.";
      else {
        status = /^same-origin(?:-allow-popups)?$/i.test(value.trim()) ? "pass" : "warning";
        description = status === "pass" ? "Cross-origin browsing contexts are isolated." : "COOP should normally be same-origin.";
      }
    }

    return { name, present: Boolean(value), value, status, description };
  });
}
