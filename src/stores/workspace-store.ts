"use client";

import { create } from "zustand";

type WorkspaceSelection = {
  workspaceId: string | null;
  workspaceSlug: string | null;
  projectId: string | null;
};

type WorkspaceStore = WorkspaceSelection & {
  setWorkspace: (workspaceId: string, workspaceSlug: string) => void;
  setProject: (projectId: string | null) => void;
  clear: () => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaceId: null,
  workspaceSlug: null,
  projectId: null,
  setWorkspace: (workspaceId, workspaceSlug) =>
    set({ workspaceId, workspaceSlug, projectId: null }),
  setProject: (projectId) => set({ projectId }),
  clear: () => set({ workspaceId: null, workspaceSlug: null, projectId: null }),
}));
