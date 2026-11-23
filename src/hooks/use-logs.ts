"use client";

import { useQuery } from "@tanstack/react-query";
import type { NormalizedLog } from "@/lib/logs/normalize";

export type LogFilters = {
  projectId: string | null;
  service?: "monitor" | "api" | "security" | "incident";
  statusGroup?: "2xx" | "4xx" | "5xx" | "timeout" | "error";
  search?: string;
  from?: string;
  to?: string;
  requestId?: string;
};

export function useLogs(filters: LogFilters) {
  return useQuery({
    queryKey: ["logs", filters],
    enabled: Boolean(filters.projectId),
    refetchInterval: 30_000,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.service) params.set("service", filters.service);
      if (filters.statusGroup) params.set("statusGroup", filters.statusGroup);
      if (filters.search) params.set("search", filters.search);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.requestId) params.set("requestId", filters.requestId);
      const response = await fetch(`/api/logs?${params.toString()}`, { cache: "no-store" });
      const body = await response.json() as { data?: { items: NormalizedLog[]; nextCursor: string | null }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to load logs");
      return body.data;
    },
  });
}
