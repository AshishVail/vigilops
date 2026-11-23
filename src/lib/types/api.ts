import type { Json } from "@/lib/types/database";

export type ApiError = { error: string; code?: string; details?: Json };
export type ApiSuccess<T> = { data: T; message?: string };
