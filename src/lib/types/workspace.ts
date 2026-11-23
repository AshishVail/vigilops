import type { Database, WorkspaceRole } from "@/lib/types/database";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type WorkspaceRoleName = WorkspaceRole;
