import type { Database } from "@/lib/types/database";

export type Incident = Database["public"]["Tables"]["incidents"]["Row"];
export type IncidentUpdate = Database["public"]["Tables"]["incident_updates"]["Row"];
