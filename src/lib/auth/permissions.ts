import type { WorkspaceRole } from "@/lib/types/database";

export type WorkspacePermission =
  | "workspace.update"
  | "workspace.delete"
  | "members.manage"
  | "project.create"
  | "project.update"
  | "project.delete"
  | "monitor.manage"
  | "incident.manage"
  | "alert.manage"
  | "observatory.execute"
  | "security.scan"
  | "logs.export";

const permissionRoles: Record<WorkspacePermission, WorkspaceRole[]> = {
  "workspace.update": ["owner", "admin"],
  "workspace.delete": ["owner"],
  "members.manage": ["owner", "admin"],
  "project.create": ["owner", "admin", "member"],
  "project.update": ["owner", "admin", "member"],
  "project.delete": ["owner", "admin"],
  "monitor.manage": ["owner", "admin", "member"],
  "incident.manage": ["owner", "admin", "member"],
  "alert.manage": ["owner", "admin", "member"],
  "observatory.execute": ["owner", "admin", "member"],
  "security.scan": ["owner", "admin", "member"],
  "logs.export": ["owner", "admin", "member"],
};

export function can(role: WorkspaceRole, permission: WorkspacePermission) {
  return permissionRoles[permission].includes(role);
}
