import "server-only";
import tls from "node:tls";

export type CertificateMetadata = {
  valid: boolean;
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  protocol: string | null;
};

export async function inspectCertificate(hostname: string, timeoutMs = 5000): Promise<CertificateMetadata> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: hostname, port: 443, servername: hostname, rejectUnauthorized: false }, () => {
      const certificate = socket.getPeerCertificate(true);
      const protocol = socket.getProtocol();
      socket.end();
      if (!certificate || Object.keys(certificate).length === 0) {
        resolve({ valid: false, issuer: null, subject: null, validFrom: null, validTo: null, daysRemaining: null, protocol });
        return;
      }
      const validTo = certificate.valid_to ? new Date(certificate.valid_to) : null;
      const validFrom = certificate.valid_from ? new Date(certificate.valid_from) : null;
      const now = Date.now();
      const daysRemaining = validTo ? Math.max(0, Math.ceil((validTo.getTime() - now) / 86400000)) : null;
      resolve({
        valid: socket.authorized && Boolean(validTo && validTo.getTime() > now),
        issuer: typeof certificate.issuer === "object" ? (Array.isArray(certificate.issuer?.CN) ? certificate.issuer.CN[0] : certificate.issuer?.CN ?? null) : null,
        subject: typeof certificate.subject === "object" ? (Array.isArray(certificate.subject?.CN) ? certificate.subject.CN[0] : certificate.subject?.CN ?? null) : null,
        validFrom: validFrom && !Number.isNaN(validFrom.getTime()) ? validFrom.toISOString() : null,
        validTo: validTo && !Number.isNaN(validTo.getTime()) ? validTo.toISOString() : null,
        daysRemaining,
        protocol,
      });
    });
    socket.setTimeout(timeoutMs, () => socket.destroy());
    socket.once("error", () => {
      resolve({ valid: false, issuer: null, subject: null, validFrom: null, validTo: null, daysRemaining: null, protocol: null });
    });
  });
}
