import "server-only";
import type { CertificateMetadata } from "@/lib/network/certificate";

export type CertificatePolicyResult = {
  valid: boolean;
  expiringSoon: boolean;
  issuerPresent: boolean;
  protocolModern: boolean;
  redirectEnforced: boolean;
  status: "pass" | "warning" | "fail";
  description: string;
};

export function evaluateCertificatePolicy(
  certificate: CertificateMetadata,
  httpRedirectsToHttps: boolean,
) {
  const expiringSoon = certificate.daysRemaining !== null && certificate.daysRemaining <= 30;
  const issuerPresent = Boolean(certificate.issuer);
  const protocolModern = Boolean(certificate.protocol && !/^TLSv1(\.0|\.1)?$/.test(certificate.protocol));
  const status: CertificatePolicyResult["status"] =
    !certificate.valid ? "fail" :
    expiringSoon ? "warning" :
    issuerPresent && protocolModern && httpRedirectsToHttps ? "pass" : "warning";

  let description = "The TLS certificate is valid.";
  if (!certificate.valid) description = "The TLS certificate is invalid or unavailable.";
  else if (expiringSoon) description = `The certificate expires in ${certificate.daysRemaining} days.`;
  else if (!httpRedirectsToHttps) description = "The hostname does not enforce an HTTPS redirect.";
  else if (!protocolModern) description = "The negotiated TLS protocol is outdated.";

  return {
    valid: certificate.valid,
    expiringSoon,
    issuerPresent,
    protocolModern,
    redirectEnforced: httpRedirectsToHttps,
    status,
    description,
  } satisfies CertificatePolicyResult;
}
