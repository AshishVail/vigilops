export type DashboardRange = "24h" | "7d" | "30d";
export type KpiMetric = {
  label: string;
  value: number | string;
  changePercent?: number;
  status?: "healthy" | "degraded" | "down";
};
