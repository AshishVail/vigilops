"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Monitor } from "@/lib/types/monitor";
import { useToast } from "@/components/ui/toaster";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useMonitors(projectId: string | null, workspaceId: string | null) {
  return useQuery({
    queryKey: ["monitors", projectId, workspaceId],
    enabled: Boolean(projectId || workspaceId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      else if (workspaceId) params.set("workspaceId", workspaceId);
      const response = await fetch(`/api/monitors?${params.toString()}`, { cache: "no-store" });
      return readJson<Monitor[]>(response);
    },
  });
}

export function useMonitor(monitorId: string | null) {
  return useQuery({
    queryKey: ["monitor", monitorId],
    enabled: Boolean(monitorId),
    queryFn: async () => {
      const response = await fetch(`/api/monitors/${monitorId}`, { cache: "no-store" });
      return readJson<Monitor>(response);
    },
  });
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: {
      projectId: string;
      name: string;
      url: string;
      method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
      intervalSeconds: number;
      timeoutMs: number;
      expectedStatusCodes: number[];
      headers: Record<string, string>;
    }) => {
      const response = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<Monitor>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Monitor created", variant: "success" });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { monitorId: string } & Record<string, unknown>) => {
      const { monitorId, ...body } = input;
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return readJson<Monitor>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["monitor", variables.monitorId] });
      toast({ title: "Monitor updated", variant: "success" });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (monitorId: string) => {
      const response = await fetch(`/api/monitors/${monitorId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      toast({ title: "Monitor deleted", variant: "success" });
    },
  });
}

export function usePingMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (monitorId: string) => {
      const response = await fetch("/api/monitors/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monitorId }),
      });
      const body = await response.json() as {
        data?: { ping: { id: string }; result: { status: number; latencyMs: number; error?: string } };
        error?: string;
      };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Ping failed");
      return body.data;
    },
    onSuccess: (_data, monitorId) => {
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] });
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["ping-history", monitorId] });
      toast({ title: "Ping completed", variant: "success" });
    },
  });
}
