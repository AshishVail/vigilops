import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const auth = await requireAuth();
  if (!auth) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
