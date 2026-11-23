import type { Database } from "@/lib/types/database";

export type SecurityScan = Database["public"]["Tables"]["security_scans"]["Row"];
export type SecurityFinding = {
  code: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
};
