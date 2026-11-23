export function getRequestId(request: Request) {
  const supplied = request.headers.get("x-request-id");
  if (supplied) return supplied.slice(0, 128);
  return crypto.randomUUID();
}

export function getJsonContentType(body: unknown) {
  if (body == null) return null;
  if (typeof body === "string") return "application/json";
  return "application/json";
}

export function jsonSize(value: unknown) {
  if (value == null) return 0;
  return new TextEncoder().encode(typeof value === "string" ? value : JSON.stringify(value)).length;
}
