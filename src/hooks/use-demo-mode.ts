"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DemoWorkspace = {
  workspaceId: string;
  projectId: string | null;
  slug?: string;
  expiresAt?: string | null;
  resettable: boolean;
};

export function useDemoMode() {
  const supabase = createClient();
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDemo = useCallback(async (): Promise<DemoWorkspace> => {
    setIsStarting(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError || !authData.session) throw new Error(authError?.message ?? "Anonymous authentication failed");

      const response = await fetch("/api/demo/start", {
        method: "POST",
        headers: { Authorization: `Bearer ${authData.session.access_token}` },
      });
      const body = await response.json() as { data?: DemoWorkspace; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to start demo");
      return body.data;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to start demo";
      setError(message);
      throw caught;
    } finally {
      setIsStarting(false);
    }
  }, [supabase]);

  const resetDemo = useCallback(async (workspaceId?: string): Promise<DemoWorkspace> => {
    setIsResetting(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Demo session not found");

      const response = await fetch("/api/demo/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(workspaceId ? { workspaceId } : {}),
      });
      const body = await response.json() as { data?: DemoWorkspace; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Unable to reset demo");
      return body.data;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to reset demo";
      setError(message);
      throw caught;
    } finally {
      setIsResetting(false);
    }
  }, [supabase]);

  return { startDemo, resetDemo, isStarting, isResetting, error };
}
