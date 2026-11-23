"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiRun } from "@/lib/types/observatory";
import type { ObservatoryExecutionResult } from "@/lib/observatory/executor";

export type ObservatoryExecuteInput = {
  projectId: string;
  requestId?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  headers: Record<string, string>;
  auth: { type: "none" } | { type: "bearer"; token: string } | { type: "api_key"; headerName: string; value: string };
  body?: string | Record<string, unknown> | unknown[] | null;
  timeoutMs: number;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useExecuteObservatoryRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ObservatoryExecuteInput) => {
      const response = await fetch("/api/observatory/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<{ run: ApiRun; response: ObservatoryExecutionResult }>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["observatory-history", variables.projectId] });
    },
  });
}

export function useObservatoryHistory(projectId: string | null, limit = 25) {
  return useQuery({
    queryKey: ["observatory-history", projectId, limit],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/observatory/history?projectId=${encodeURIComponent(projectId ?? "")}&limit=${limit}`, { cache: "no-store" });
      return readJson<ApiRun[]>(response);
    },
  });
}

export function useClearObservatoryHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/observatory/history?projectId=${encodeURIComponent(projectId)}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: (_data, projectId) => queryClient.invalidateQueries({ queryKey: ["observatory-history", projectId] }),
  });
}
