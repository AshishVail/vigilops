import type { HeaderCheck } from "@/lib/security/headers";
import type { CertificatePolicyResult } from "@/lib/security/certificate-policy";
import type { SecurityGrade } from "@/lib/types/database";

export type SecurityScoreResult = {
  score: number;
  grade: SecurityGrade;
};

export function calculateSecurityScore(
  headers: HeaderCheck[],
  certificate: CertificatePolicyResult,
): SecurityScoreResult {
  let score = 0;
  if (certificate.valid) score += 25;
  else if (certificate.status === "warning") score += 10;
  if (certificate.redirectEnforced) score += 5;

  for (const header of headers) {
    if (header.status === "pass") {
      if (header.name === "strict-transport-security" || header.name === "content-security-policy") score += 20;
      else if (header.name === "x-frame-options" || header.name === "x-content-type-options") score += 10;
      else if (header.name === "referrer-policy") score += 5;
      else score += 5;
    } else if (header.status === "warning") {
      score += 3;
    }
  }

  score = Math.min(100, Math.max(0, score));
  const grade: SecurityGrade =
    score >= 95 ? "A+" :
    score >= 85 ? "A" :
    score >= 75 ? "B" :
    score >= 65 ? "C" :
    score >= 50 ? "D" : "F";
  return { score, grade };
}
