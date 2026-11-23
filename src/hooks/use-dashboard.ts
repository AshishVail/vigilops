"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/lib/analytics/dashboard";
import type { DashboardRange } from "@/lib/types/dashboard";

export function useDashboard(workspaceId: string | null, projectId: string | null, range: DashboardRange) {
  return useQuery({
    queryKey: ["dashboard", workspaceId, projectId, range],
    enabled: Boolean(workspaceId),
    refetchInterval: 30_000,
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId ?? "", range });
      if (projectId) params.set("projectId", projectId);
      const response = await fetch(`/api/dashboard?${params.toString()}`, { cache: "no-store" });
      const body = await response.json() as { data?: DashboardData; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to load dashboard");
      return body.data;
    },
  });
}
