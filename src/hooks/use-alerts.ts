"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlertChannel } from "@/lib/types/alert";
import { useToast } from "@/components/ui/toaster";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useAlertChannels(workspaceId: string | null) {
  return useQuery({
    queryKey: ["alerts", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async () => {
      const response = await fetch(`/api/alerts?workspaceId=${encodeURIComponent(workspaceId ?? "")}`, { cache: "no-store" });
      return readJson<AlertChannel[]>(response);
    },
  });
}

export function useCreateAlertChannel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: {
      workspaceId: string;
      projectId?: string | null;
      type: "discord" | "slack" | "email";
      name: string;
      destination: string;
      isActive: boolean;
      onDown: boolean;
      onRecovery: boolean;
    }) => {
      const response = await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      return readJson<AlertChannel>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({ title: "Alert channel created", variant: "success" });
    },
  });
}

export function useUpdateAlertChannel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { alertId: string; name?: string; destination?: string; projectId?: string | null; isActive?: boolean; onDown?: boolean; onRecovery?: boolean }) => {
      const { alertId, ...body } = input;
      const response = await fetch(`/api/alerts/${alertId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return readJson<AlertChannel>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({ title: "Alert channel updated", variant: "success" });
    },
  });
}

export function useDeleteAlertChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useTestAlertChannel() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/test`, { method: "POST" });
      return readJson<{ status: "succeeded" | "skipped"; detail: string }>(response);
    },
    onSuccess: (result) => toast({ title: result.status === "skipped" ? "Test skipped" : "Test alert sent", description: result.detail, variant: result.status === "skipped" ? "default" : "success" }),
  });
}
