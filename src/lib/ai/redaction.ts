const sensitiveKeyPattern = /(?:authorization|proxy-authorization|cookie|set-cookie|api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret|client[_-]?secret)/i;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const basicPattern = /\bBasic\s+[A-Za-z0-9+/=]+/gi;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function redactString(value: string) {
  return value
    .replace(bearerPattern, "Bearer [REDACTED]")
    .replace(basicPattern, "Basic [REDACTED]")
    .replace(jwtPattern, "[REDACTED_JWT]")
    .replace(emailPattern, "[REDACTED_EMAIL]")
    .replace(ipPattern, "[REDACTED_IP]");
}

export function redactSensitiveValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === "string") return redactString(value);
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => redactSensitiveValue(item, seen));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[REDACTED]" : redactSensitiveValue(item, seen),
    ]),
  );
}

export function redactJsonText(value: string) {
  try {
    return JSON.stringify(redactSensitiveValue(JSON.parse(value)), null, 2);
  } catch {
    return redactString(value);
  }
}
