import type { HeaderCheck } from "@/lib/security/headers";
import type { CertificatePolicyResult } from "@/lib/security/certificate-policy";
import type { SecurityFinding } from "@/lib/types/security";

export function generateSecurityFindings(
  headers: HeaderCheck[],
  certificatePolicy: CertificatePolicyResult,
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  if (!certificatePolicy.valid) {
    findings.push({
      code: "TLS_INVALID",
      severity: "high",
      title: "TLS certificate is invalid",
      description: "The hostname did not present a currently valid trusted certificate.",
      recommendation: "Renew or replace the certificate and verify the full certificate chain.",
    });
  } else if (certificatePolicy.expiringSoon) {
    findings.push({
      code: "TLS_EXPIRING",
      severity: "medium",
      title: "TLS certificate expires soon",
      description: "The certificate has 30 days or less remaining.",
      recommendation: "Renew the certificate and verify automatic renewal monitoring.",
    });
  }

  if (!certificatePolicy.redirectEnforced) {
    findings.push({
      code: "HTTPS_REDIRECT",
      severity: "medium",
      title: "HTTPS redirect not enforced",
      description: "The HTTP endpoint did not redirect all traffic to HTTPS.",
      recommendation: "Configure a permanent HTTPS redirect at the edge or origin.",
    });
  }

  for (const header of headers) {
    if (header.status === "pass") continue;
    findings.push({
      code: `HEADER_${header.name.toUpperCase().replaceAll("-", "_")}`,
      severity: header.status === "fail" ? "high" : "medium",
      title: header.present ? `Weak ${header.name} policy` : `Missing ${header.name}`,
      description: header.description,
      recommendation: header.status === "fail"
        ? `Add a correctly configured ${header.name} response header.`
        : `Strengthen the existing ${header.name} value and test for compatibility.`,
    });
  }

  const severityRank = { high: 0, medium: 1, low: 2 };
  return findings.sort((left, right) => severityRank[left.severity] - severityRank[right.severity]);
}
