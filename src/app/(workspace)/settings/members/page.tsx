"use client";

import { useCallback, useEffect, useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toaster";
import type { WorkspaceRole } from "@/lib/types/database";

type MemberRow = {
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  profile: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function WorkspaceMembersPage() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [sending, setSending] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("workspace_members")
      .select("user_id, role, joined_at, profile:profiles(full_name, email, avatar_url)")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });
    if (error) {
      toast({ title: "Unable to load members", description: error.message, variant: "danger" });
      setLoading(false);
      return;
    }
    setMembers((data ?? []) as MemberRow[]);
    setLoading(false);
  }, [workspaceId, supabase, toast]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function inviteMember() {
    if (!workspaceId || !email.trim()) return;
    setSending(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberAction: "invite", email: email.trim(), role: inviteRole }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Unable to invite member");
      setEmail("");
      toast({ title: "Invitation sent", description: `Invited ${email.trim()} as ${inviteRole}`, variant: "success" });
      await loadMembers();
    } catch (error) {
      toast({ title: "Invitation failed", description: error instanceof Error ? error.message : "Unable to invite member", variant: "danger" });
    } finally {
      setSending(false);
    }
  }

  async function updateRole(userId: string, role: "admin" | "member" | "viewer") {
    if (!workspaceId) return;
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberAction: "update_role", userId, role }),
    });
    const body = await response.json() as { error?: string };
    if (!response.ok) {
      toast({ title: "Role update failed", description: body.error ?? "Unable to update role", variant: "danger" });
      return;
    }
    toast({ title: "Member role updated", variant: "success" });
    await loadMembers();
  }

  async function removeMember(userId: string) {
    if (!workspaceId) return;
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberAction: "remove", userId }),
    });
    const body = await response.json() as { error?: string };
    if (!response.ok) {
      toast({ title: "Unable to remove member", description: body.error ?? "Remove failed", variant: "danger" });
      return;
    }
    toast({ title: "Member removed", variant: "success" });
    await loadMembers();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-violet-400">Access control</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Workspace members</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Invite a member</CardTitle><CardDescription>Send a secure Supabase invitation to an email address.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-2"><Label htmlFor="member-email">Email address</Label><Input id="member-email" type="email" placeholder="engineer@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="w-full space-y-2 sm:w-36"><Label htmlFor="member-role">Role</Label><Select id="member-role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "admin" | "member" | "viewer")}><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></Select></div>
          <div className="flex items-end"><Button disabled={!email.trim() || sending} onClick={inviteMember}>{sending ? "Sending..." : "Send invite"}</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Members</CardTitle><CardDescription>{loading ? "Loading workspace access..." : `${members.length} workspace member${members.length === 1 ? "" : "s"}`}</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.user_id} className="flex flex-col gap-3 rounded-lg border border-[#1F2633] p-3 sm:flex-row sm:items-center">
              <Avatar name={member.profile?.full_name ?? member.profile?.email ?? "VigilOps member"} src={member.profile?.avatar_url ?? undefined} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{member.profile?.full_name ?? "VigilOps member"}</p><p className="truncate text-xs text-slate-500">{member.profile?.email ?? member.user_id}</p></div>
              {member.role === "owner" ? (
                <Badge variant="violet">Owner</Badge>
              ) : (
                <>
                  <Select aria-label="Member role" value={member.role} onChange={(event) => void updateRole(member.user_id, event.target.value as "admin" | "member" | "viewer")} className="w-32"><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></Select>
                  <Button variant="danger" size="sm" onClick={() => void removeMember(member.user_id)}>Remove</Button>
                </>
              )}
            </div>
          ))}
          {!loading && members.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No workspace members found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
