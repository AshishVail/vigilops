"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useWorkspaces, useWorkspace, useUpdateWorkspace, useDeleteWorkspace, useCreateWorkspace } from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

export default function WorkspaceSettingsPage() {
  const workspaces = useWorkspaces();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const workspaceQuery = useWorkspace(workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [publicStatus, setPublicStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (workspaceQuery.data) {
      setName(workspaceQuery.data.workspace.name);
      setSlug(workspaceQuery.data.workspace.slug);
      setPublicStatus(workspaceQuery.data.workspace.public_status_enabled);
    }
  }, [workspaceQuery.data]);

  if (workspaces.isLoading || (workspaces.data?.length && !workspaceId) || (workspaceId && workspaceQuery.isLoading)) {
    return <SettingsSkeleton />;
  }

  if (workspaces.error) {
    return (
      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <EmptyState title="Workspaces unavailable" description={workspaces.error instanceof Error ? workspaces.error.message : "Unable to load your workspaces."} action={<Button variant="outline" onClick={() => void workspaces.refetch()}>Retry</Button>} />
      </div>
    );
  }

  if (workspaces.isSuccess && workspaces.data.length === 0) {
    return <CreateFirstWorkspace />;
  }

  if (!workspaceId) return <SettingsSkeleton />;

  if (workspaceQuery.error) {
    return (
      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <EmptyState title="Workspace unavailable" description={workspaceQuery.error instanceof Error ? workspaceQuery.error.message : "Unable to load workspace settings."} action={<Button variant="outline" onClick={() => void workspaceQuery.refetch()}>Retry</Button>} />
      </div>
    );
  }

  if (!workspaceQuery.data) {
    return (
      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <EmptyState title="Workspace unavailable" description="Your selected workspace is not available. Choose another workspace or create one." />
      </div>
    );
  }

  const { role } = workspaceQuery.data;
  const readOnly = !["owner", "admin"].includes(role);

  async function saveSettings() {
    if (!workspaceId) return;
    await updateWorkspace.mutateAsync({ workspaceId, name, slug, publicStatusEnabled: publicStatus });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">General settings</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Workspace profile</CardTitle><CardDescription>Configure the name and public status address.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="workspace-name">Workspace name</Label><Input id="workspace-name" value={name} disabled={readOnly} onChange={(event) => setName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="workspace-slug">Status slug</Label><Input id="workspace-slug" value={slug} disabled={readOnly} onChange={(event) => setSlug(event.target.value.replace(/[^a-z0-9-]/g, ""))} /></div>
          </div>

          <div className="flex items-start justify-between gap-6 rounded-lg border border-[#1F2633] bg-[#090B10] p-4">
            <div><p className="text-sm font-medium">Public status page</p><p className="mt-1 text-xs text-slate-500">Allow approved operational status at <a className="text-violet-300" href={`/status/${slug}`}>/status/{slug}</a>.</p></div>
            <Switch checked={publicStatus} disabled={readOnly} onClick={() => setPublicStatus((value) => !value)} aria-label="Enable public status page" />
          </div>

          <div className="flex justify-end"><Button disabled={readOnly || updateWorkspace.isPending} onClick={saveSettings}>{updateWorkspace.isPending ? "Saving..." : "Save changes"}</Button></div>
        </CardContent>
      </Card>

      {role === "owner" && (
        <Card className="border-rose-500/20">
          <CardHeader><CardTitle className="text-rose-300">Danger zone</CardTitle><CardDescription>Deleting a workspace removes its projects, monitors, incidents, and logs.</CardDescription></CardHeader>
          <CardContent className="flex justify-end"><Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete workspace</Button></CardContent>
        </Card>
      )}

      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete workspace" description="This action cannot be undone. Demo workspaces cannot be deleted directly." confirmLabel="Delete workspace" destructive onConfirm={() => { if (workspaceId) deleteWorkspace.mutate(workspaceId); }} />
    </div>
  );
}

function CreateFirstWorkspace() {
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createWorkspace.mutate({ name });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your workspace</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Get started</CardTitle><CardDescription>Create a workspace to organize projects, monitors, and incidents.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="new-workspace-name">Workspace name</Label><Input id="new-workspace-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Production" minLength={2} maxLength={60} required /></div>
            {createWorkspace.error && <p role="alert" className="text-sm text-rose-300">{createWorkspace.error.message}</p>}
            <div className="flex justify-end"><Button type="submit" disabled={createWorkspace.isPending}>{createWorkspace.isPending ? "Creating..." : "Create workspace"}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-72 animate-pulse rounded-xl border border-[#1F2633] bg-[#0E121A]" />
    </div>
  );
}
