"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PingLog } from "@/lib/types/monitor";

export function usePingHistory(monitorId: string | null, limit = 25) {
  return useInfiniteQuery({
    queryKey: ["ping-history", monitorId, limit],
    enabled: Boolean(monitorId),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set("cursor", pageParam);
      const response = await fetch(`/api/monitors/${monitorId}/logs?${params.toString()}`, { cache: "no-store" });
      const body = await response.json() as { data?: { items: PingLog[]; nextCursor: string | null }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to load ping history");
      return body.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
