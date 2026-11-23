import { Activity, Gauge, Globe2, ShieldCheck, AlertTriangle, Bell, Logs, Sparkles, Settings } from "lucide-react";
import type { ComponentType } from "react";

export type CommandPaletteItem = { label: string; description: string; href: string; icon: ComponentType<{ className?: string }> };
export const commandPaletteItems: CommandPaletteItem[] = [
  { label:"Command Center", description:"Open executive dashboard", href:"/dashboard", icon:Gauge },
  { label:"Monitors", description:"Manage uptime checks", href:"/monitors", icon:Activity },
  { label:"Observatory", description:"Execute API requests", href:"/observatory", icon:Globe2 },
  { label:"Security", description:"Run security scans", href:"/security", icon:ShieldCheck },
  { label:"Incidents", description:"Review incident queue", href:"/incidents", icon:AlertTriangle },
  { label:"Alerts", description:"Configure notification channels", href:"/alerts", icon:Bell },
  { label:"Logs", description:"Explore operational logs", href:"/logs", icon:Logs },
  { label:"AI Doctor", description:"Diagnose operational evidence", href:"/ai", icon:Sparkles },
  { label:"Settings", description:"Manage workspace settings", href:"/settings", icon:Settings },
];
