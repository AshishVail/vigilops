import type { Database } from "@/lib/types/database";

export type Monitor = Database["public"]["Tables"]["monitors"]["Row"];
export type PingLog = Database["public"]["Tables"]["ping_logs"]["Row"];
