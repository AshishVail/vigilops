"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/lib/types/workspace";
import { useToast } from "@/components/ui/toaster";

type ProjectApiResponse<T> = { data: T };

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as ProjectApiResponse<T> & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async () => {
      const response = await fetch(`/api/projects?workspaceId=${encodeURIComponent(workspaceId ?? "")}`, { cache: "no-store" });
      return readJson<Project[]>(response);
    },
  });
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      return readJson<Project>(response);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { workspaceId: string; name: string; description?: string; color?: string; publicStatusEnabled?: boolean }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<Project>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project created", variant: "success" });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { projectId: string; name?: string; description?: string | null; color?: string; publicStatusEnabled?: boolean }) => {
      const { projectId, ...body } = input;
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return readJson<Project>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      toast({ title: "Project updated", variant: "success" });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted", variant: "success" });
    },
  });
}
