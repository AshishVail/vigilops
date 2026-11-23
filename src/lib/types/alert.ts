import type { Database } from "@/lib/types/database";

export type AlertChannel = Database["public"]["Tables"]["alert_channels"]["Row"];
export type AlertDelivery = Database["public"]["Tables"]["alert_deliveries"]["Row"];
