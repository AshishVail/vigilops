"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SecurityScan } from "@/lib/types/security";
import { useToast } from "@/components/ui/toaster";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useSecurityScans(projectId: string | null, workspaceId: string | null) {
  return useQuery({
    queryKey: ["security-scans", projectId, workspaceId],
    enabled: Boolean(projectId || workspaceId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      else if (workspaceId) params.set("workspaceId", workspaceId);
      const response = await fetch(`/api/security/scan?${params.toString()}`, { cache: "no-store" });
      return readJson<SecurityScan[]>(response);
    },
  });
}

export function useSecurityScan(scanId: string | null) {
  return useQuery({
    queryKey: ["security-scan", scanId],
    enabled: Boolean(scanId),
    queryFn: async () => {
      const response = await fetch(`/api/security/${scanId}`, { cache: "no-store" });
      return readJson<SecurityScan>(response);
    },
  });
}

export function useCreateSecurityScan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { projectId: string; domain: string }) => {
      const response = await fetch("/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<SecurityScan>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-scans"] });
      toast({ title: "Security scan completed", variant: "success" });
    },
  });
}

export function useDeleteSecurityScan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (scanId: string) => {
      const response = await fetch(`/api/security/${scanId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-scans"] });
      toast({ title: "Security scan deleted", variant: "success" });
    },
  });
}
