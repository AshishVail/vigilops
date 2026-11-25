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
import { Badge } from "@/components/ui/badge";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useToast } from "@/components/ui/toaster";
import { Copy, CreditCard, ExternalLink, Settings2, Users } from "lucide-react";
import Link from "next/link";

export default function WorkspaceSettingsPage() {
  const workspaces = useWorkspaces();
  const { user } = useSupabase();
  const { toast } = useToast();
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
  const statusUrl = `/status/${workspaceQuery.data.workspace.slug}`;

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied`, variant: "success" });
    } catch (error) {
      toast({ title: `Unable to copy ${label.toLowerCase()}`, description: error instanceof Error ? error.message : "Clipboard access was denied.", variant: "danger" });
    }
  }

  async function saveSettings() {
    if (!workspaceId) return;
    await updateWorkspace.mutateAsync({ workspaceId, name, slug, publicStatusEnabled: publicStatus });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">General settings</h1>
      </div>

      <nav aria-label="Settings sections" className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <Link href="/settings" aria-current="page" className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"><Settings2 className="h-4 w-4" />General</Link>
        <Link href="/settings/members" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><Users className="h-4 w-4" />Team members</Link>
        <Link href="/settings/billing" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"><CreditCard className="h-4 w-4" />Billing &amp; usage</Link>
      </nav>

      <Card>
        <CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle>Account overview</CardTitle><CardDescription>Your identity and access in this workspace.</CardDescription></div><Badge variant={role === "owner" ? "violet" : "default"}>{role}</Badge></div></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div><p className="text-xs font-medium text-slate-600">Signed in as</p><p className="mt-1 truncate text-sm font-semibold text-slate-900">{user?.email ?? "Authenticated account"}</p></div>
          <div><p className="text-xs font-medium text-slate-600">Workspace ID</p><div className="mt-1 flex items-center gap-2"><code className="truncate rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700">{workspaceId}</code><Button aria-label="Copy workspace ID" variant="outline" size="icon" onClick={() => void copyValue(workspaceId, "Workspace ID")}><Copy className="h-3.5 w-3.5" /></Button></div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex flex-wrap items-start justify-between gap-4"><div><CardTitle>Public status page</CardTitle><CardDescription>Share a safe, read-only view of operational health with your customers.</CardDescription></div><Badge variant={workspaceQuery.data.workspace.public_status_enabled ? "success" : "default"}>{workspaceQuery.data.workspace.public_status_enabled ? "Enabled" : "Disabled"}</Badge></div></CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-mono text-sm text-slate-700">{typeof window === "undefined" ? "" : window.location.origin}{statusUrl}</p><p className="mt-1 text-xs text-slate-600">{workspaceQuery.data.workspace.public_status_enabled ? "Your public page is available at this address." : "Enable public status below to make this page available."}</p></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copyValue(`${window.location.origin}${statusUrl}`, "Status page link")}><Copy className="h-3.5 w-3.5" />Copy link</Button>
            <Link href={statusUrl} target="_blank" aria-disabled={!workspaceQuery.data.workspace.public_status_enabled} className={`inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium ${workspaceQuery.data.workspace.public_status_enabled ? "text-slate-700 hover:bg-slate-50" : "pointer-events-none text-slate-400"}`}><ExternalLink className="h-3.5 w-3.5" />Open page</Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Workspace profile</CardTitle><CardDescription>Configure the name and public status address.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="workspace-name">Workspace name</Label><Input id="workspace-name" value={name} disabled={readOnly} onChange={(event) => setName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="workspace-slug">Status slug</Label><Input id="workspace-slug" value={slug} disabled={readOnly} onChange={(event) => setSlug(event.target.value.replace(/[^a-z0-9-]/g, ""))} /></div>
          </div>

          <div className="flex items-start justify-between gap-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div><p className="text-sm font-medium">Public status page</p><p className="mt-1 text-xs text-slate-600">Allow approved operational status at <a className="text-violet-700" href={`/status/${slug}`}>/status/{slug}</a>.</p></div>
            <Switch checked={publicStatus} disabled={readOnly} onClick={() => setPublicStatus((value) => !value)} aria-label="Enable public status page" />
          </div>

          <div className="flex justify-end"><Button disabled={readOnly || updateWorkspace.isPending} onClick={saveSettings}>{updateWorkspace.isPending ? "Saving..." : "Save changes"}</Button></div>
        </CardContent>
      </Card>

      {role === "owner" && (
        <Card className="border-rose-500/20">
          <CardHeader><CardTitle className="text-rose-700">Danger zone</CardTitle><CardDescription>Deleting a workspace removes its projects, monitors, incidents, and logs.</CardDescription></CardHeader>
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
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-700">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your workspace</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Get started</CardTitle><CardDescription>Create a workspace to organize projects, monitors, and incidents.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="new-workspace-name">Workspace name</Label><Input id="new-workspace-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Production" minLength={2} maxLength={60} required /></div>
            {createWorkspace.error && <p role="alert" className="text-sm text-rose-700">{createWorkspace.error.message}</p>}
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
      <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
