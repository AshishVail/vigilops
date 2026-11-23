export type PublicIncident = {
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
  startedAt: string;
  resolvedAt: string | null;
};
