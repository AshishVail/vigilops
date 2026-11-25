"use client";

import { use } from "react";
import { useIncident } from "@/hooks/use-incidents";
import { IncidentDetail } from "@/components/incidents/incident-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentDetailPage({ params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = use(params);
  const incident = useIncident(incidentId);
  if (incident.isLoading) return <div className="p-5 lg:p-8"><Skeleton className="h-96"/></div>;
  if (!incident.data) return <div className="p-5 lg:p-8 text-sm text-slate-600">Incident not found.</div>;
  return <div className="mx-auto max-w-[1600px] p-5 lg:p-8"><IncidentDetail incident={incident.data.incident} updates={incident.data.updates}/></div>;
}
