import "server-only";
import type { WorkspaceRole } from "@/lib/types/database";

const roleHierarchy: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

export function hasMinimumRole(role: WorkspaceRole, required: WorkspaceRole) {
  return roleHierarchy[role] >= roleHierarchy[required];
}
