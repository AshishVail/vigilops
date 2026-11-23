import { NextRequest } from "next/server";
import packageJson from "../../../../package.json";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  let supabase = "ok";
  try {
    const client = await createClient();
    const { error } = await client.from("profiles").select("id").limit(1);
    if (error) supabase = "degraded";
  } catch {
    supabase = "degraded";
  }
  return Response.json({
    status: supabase === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    uptime: process.uptime(),
    dependencies: { supabase },
  }, {
    status: supabase === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
