"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Incident, IncidentUpdate } from "@/lib/types/incident";
import { useToast } from "@/components/ui/toaster";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useIncidents(projectId: string | null, workspaceId: string | null) {
  return useQuery({
    queryKey: ["incidents", projectId, workspaceId],
    enabled: Boolean(projectId || workspaceId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      else if (workspaceId) params.set("workspaceId", workspaceId);
      const response = await fetch(`/api/incidents?${params.toString()}`, { cache: "no-store" });
      return readJson<Incident[]>(response);
    },
  });
}

export function useIncident(incidentId: string | null) {
  return useQuery({
    queryKey: ["incident", incidentId],
    enabled: Boolean(incidentId),
    queryFn: async () => {
      const response = await fetch(`/api/incidents/${incidentId}`, { cache: "no-store" });
      return readJson<{ incident: Incident; updates: IncidentUpdate[] }>(response);
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { projectId: string; monitorId?: string | null; title: string; summary?: string; severity: "low" | "medium" | "high" | "critical" }) => {
      const response = await fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      return readJson<Incident>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Incident created", variant: "success" });
    },
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { incidentId: string; status?: Incident["status"]; severity?: Incident["severity"]; title?: string; summary?: string | null; rootCauseNotes?: string | null; resolutionNotes?: string | null }) => {
      const { incidentId, ...body } = input;
      const response = await fetch(`/api/incidents/${incidentId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return readJson<Incident>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Incident updated", variant: "success" });
    },
  });
}

export function useAddIncidentUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { incidentId: string; status: Incident["status"]; message?: string }) => {
      const { incidentId, ...body } = input;
      const response = await fetch(`/api/incidents/${incidentId}/updates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return readJson<IncidentUpdate>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
      toast({ title: "Timeline updated", variant: "success" });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await fetch(`/api/incidents/${incidentId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
