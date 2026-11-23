"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryProvider>{children}</QueryProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
