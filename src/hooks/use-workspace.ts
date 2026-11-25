"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Workspace } from "@/lib/types/workspace";
import type { WorkspaceRole } from "@/lib/types/database";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useToast } from "@/components/ui/toaster";

type WorkspaceMembership = {
  role: WorkspaceRole;
  joined_at: string;
  workspace: Workspace;
};

type WorkspaceApiResponse<T> = { data: T };

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as WorkspaceApiResponse<T> & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useWorkspaces() {
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const clearWorkspace = useWorkspaceStore((state) => state.clear);
  const currentId = useWorkspaceStore((state) => state.workspaceId);
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspaces", { cache: "no-store" });
      return readJson<WorkspaceMembership[]>(response);
    },
  });

  useEffect(() => {
    if (!query.isSuccess) return;

    const currentMembership = query.data.find(({ workspace }) => workspace.id === currentId);
    if (currentMembership) return;

    const membership = query.data[0];
    if (membership) {
      setWorkspace(membership.workspace.id, membership.workspace.slug);
    } else if (currentId) {
      clearWorkspace();
    }
  }, [query.data, query.isSuccess, currentId, setWorkspace, clearWorkspace]);

  return query;
}

export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    enabled: Boolean(workspaceId),
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${workspaceId}`, { cache: "no-store" });
      return readJson<{ workspace: Workspace; role: WorkspaceRole }>(response);
    },
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { name: string; slug?: string; publicStatusEnabled?: boolean }) => {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return readJson<{ workspace: Workspace; project: { id: string }; role: WorkspaceRole }>(response);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setWorkspace(result.workspace.id, result.workspace.slug);
      toast({ title: "Workspace created", description: result.workspace.name, variant: "success" });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: { workspaceId: string; name?: string; slug?: string; publicStatusEnabled?: boolean }) => {
      const { workspaceId, ...body } = input;
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return readJson<Workspace>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast({ title: "Workspace updated", variant: "success" });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const clear = useWorkspaceStore((state) => state.clear);
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => {
      clear();
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      toast({ title: "Workspace deleted", variant: "success" });
    },
  });
}
