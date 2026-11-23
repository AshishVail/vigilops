import type { ApiError, ApiSuccess } from "@/lib/types/api";

export function successJson<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { data };
  return Response.json(body, init);
}

export function errorJson(error: string, status = 400, code?: string): Response {
  const body: ApiError = { error, ...(code ? { code } : {}) };
  return Response.json(body, { status });
}

export function unauthorizedJson(): Response {
  return errorJson("Authentication required", 401, "UNAUTHORIZED");
}

export function forbiddenJson(): Response {
  return errorJson("You do not have permission to perform this action", 403, "FORBIDDEN");
}

export function noContentJson(): Response {
  return new Response(null, { status: 204 });
}
