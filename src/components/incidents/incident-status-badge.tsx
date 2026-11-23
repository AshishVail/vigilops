import { Badge } from "@/components/ui/badge";
import type { Incident } from "@/lib/types/incident";

export function IncidentStatusBadge({ status }: { status: Incident["status"] }) {
  const variant = status === "resolved" ? "success" : status === "monitoring" ? "violet" : status === "identified" ? "warning" : "danger";
  return <Badge variant={variant}>{status}</Badge>;
}
