"use client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaces } from "@/hooks/use-workspace";
import { Select } from "@/components/ui/select";

export function WorkspaceSwitcher() {
  const workspaces = useWorkspaces();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
  const selected = workspaces.data?.find(({ workspace }) => workspace.id === workspaceId);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-violet-600 text-[10px] text-white">
        {selected?.workspace.name[0]?.toUpperCase() ?? "V"}
      </span>
      <Select
        aria-label="Active workspace"
        className="h-8 max-w-40 border-transparent bg-transparent px-1 text-slate-600 hover:bg-slate-100"
        disabled={workspaces.isLoading || !workspaces.data?.length}
        value={workspaceId ?? ""}
        onChange={(event) => {
          const membership = workspaces.data?.find(({ workspace }) => workspace.id === event.target.value);
          if (membership) setWorkspace(membership.workspace.id, membership.workspace.slug);
        }}
      >
        {!workspaces.data?.length && (
          <option value="">
            {workspaces.isLoading ? "Loading workspaces..." : workspaces.error ? "Workspaces unavailable" : "No workspace"}
          </option>
        )}
        {workspaces.data?.map(({ workspace }) => (
          <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
        ))}
      </Select>
    </div>
  );
}
