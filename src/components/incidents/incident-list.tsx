import type { Incident } from "@/lib/types/incident";
import { IncidentCard } from "@/components/incidents/incident-card";
import { EmptyState } from "@/components/ui/empty-state";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return <EmptyState title="No incidents" description="Your workspace has no matching incident records." />;
  }
  return <div className="grid gap-4 lg:grid-cols-2">{incidents.map((incident) => <IncidentCard key={incident.id} incident={incident} />)}</div>;
}
