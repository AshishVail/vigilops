import type { Database } from "@/lib/types/database";

export type ApiCollection = Database["public"]["Tables"]["api_collections"]["Row"];
export type ApiRequest = Database["public"]["Tables"]["api_requests"]["Row"];
export type ApiRun = Database["public"]["Tables"]["api_runs"]["Row"];
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiKeyAuth = { type: "api_key"; headerName: string; value: string };
export type BearerAuth = { type: "bearer"; token: string };
export type ApiAuth = { type: "none" } | BearerAuth | ApiKeyAuth;
