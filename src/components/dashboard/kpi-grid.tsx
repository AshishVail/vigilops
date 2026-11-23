import type { DashboardData } from "@/lib/analytics/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";

export function KpiGrid({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard metric={{ label: "Global uptime", value: `${data.kpis.uptime.toFixed(2)}%`, status: data.kpis.uptime >= 99 ? "healthy" : data.kpis.uptime >= 95 ? "degraded" : "down" }} />
      <KpiCard metric={{ label: "Average latency", value: `${data.kpis.averageLatency} ms`, status: data.kpis.averageLatency < 500 ? "healthy" : data.kpis.averageLatency < 1500 ? "degraded" : "down" }} />
      <KpiCard metric={{ label: "Active monitors", value: data.kpis.activeMonitors, status: "healthy" }} />
      <KpiCard metric={{ label: "Open incidents", value: data.kpis.openIncidents, status: data.kpis.openIncidents === 0 ? "healthy" : "degraded" }} />
    </div>
  );
}
