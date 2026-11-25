export const demoMonitors = [
  { name: "Production API", url: "https://example.com", method: "GET", intervalSeconds: 300, timeoutMs: 10000, expectedStatusCodes: [200], status: "operating" as const },
  { name: "Status Service", url: "https://httpbin.org/status/200", method: "GET", intervalSeconds: 300, timeoutMs: 10000, expectedStatusCodes: [200], status: "operating" as const },
  { name: "Payment Gateway", url: "https://httpbin.org/status/503", method: "GET", intervalSeconds: 300, timeoutMs: 10000, expectedStatusCodes: [200, 201, 202], status: "down" as const },
];

export const demoProjects = [
  { name: "Core Platform", description: "Production services monitored in the live demo.", color: "#6366F1", publicStatusEnabled: true },
];

export const demoSecurityFinding = {
  domain: "example.com",
  security_score: 82,
  grade: "B" as const,
  certificate: { valid: true, daysRemaining: 89, issuer: "Demo Issuer" },
  headers: { "x-content-type-options": "nosniff", "x-frame-options": "DENY" },
  findings: [
    {
      code: "CSP-MISSING",
      severity: "medium",
      title: "Content Security Policy missing",
      description: "The response does not advertise a Content-Security-Policy header.",
      recommendation: "Configure a restrictive Content-Security-Policy and test it in report-only mode first.",
    },
  ],
};
