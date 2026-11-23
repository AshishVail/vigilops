"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiCollection, ApiRequest } from "@/lib/types/observatory";
import { useToast } from "@/components/ui/toaster";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as { data?: T; error?: string };
  if (!response.ok || body.data === undefined) throw new Error(body.error ?? "Request failed");
  return body.data;
}

export function useCollections(projectId: string | null) {
  return useQuery({
    queryKey: ["collections", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/collections?projectId=${encodeURIComponent(projectId ?? "")}`, { cache: "no-store" });
      return readJson<ApiCollection[]>(response);
    },
  });
}

export function useCollection(collectionId: string | null) {
  return useQuery({
    queryKey: ["collection", collectionId],
    enabled: Boolean(collectionId),
    queryFn: async () => {
      const response = await fetch(`/api/collections/${collectionId}`, { cache: "no-store" });
      return readJson<{ collection: ApiCollection; requests: ApiRequest[] }>(response);
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { projectId: string; name: string; description?: string }) => {
      const response = await fetch("/api/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      return readJson<ApiCollection>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({ title: "Collection created", variant: "success" });
    },
  });
}

export function useSaveApiRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: {
      collectionId: string;
      name: string;
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      url: string;
      queryParams: Array<{ key: string; value: string; enabled: boolean }>;
      headers: Record<string, string>;
      auth: { type: "none" } | { type: "bearer"; token: string } | { type: "api_key"; headerName: string; value: string };
      body?: unknown;
    }) => {
      const response = await fetch(`/api/collections/${input.collectionId}/requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      return readJson<ApiRequest>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection", variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({ title: "Request saved", variant: "success" });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
      return readJson<{ deleted: boolean }>(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });
}
