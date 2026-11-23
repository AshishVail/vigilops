export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type MonitorStatus = "operating" | "degraded" | "down" | "paused";
export type PingStatus = "success" | "failure" | "timeout" | "error";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type SecurityGrade = "A+" | "A" | "B" | "C" | "D" | "F";
export type AlertChannelType = "discord" | "slack" | "email";
export type AlertDeliveryStatus = "pending" | "succeeded" | "failed";
export type ActivityType =
  | "monitor_created"
  | "monitor_updated"
  | "monitor_deleted"
  | "ping_completed"
  | "incident_created"
  | "incident_updated"
  | "incident_resolved"
  | "api_request_executed"
  | "security_scan_completed"
  | "alert_sent"
  | "workspace_member_added";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string | null; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; email?: string | null; full_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; email?: string | null; full_name?: string | null; avatar_url?: string | null; updated_at?: string };
        Relationships: [];
      };
      workspaces: {
        Row: { id: string; name: string; slug: string; owner_id: string; is_demo: boolean; expires_at: string | null; public_status_enabled: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; slug: string; owner_id: string; is_demo?: boolean; expires_at?: string | null; public_status_enabled?: boolean; created_at?: string; updated_at?: string };
        Update: { name?: string; slug?: string; owner_id?: string; is_demo?: boolean; expires_at?: string | null; public_status_enabled?: boolean; updated_at?: string };
        Relationships: [{ foreignKeyName: "workspaces_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      workspace_members: {
        Row: { workspace_id: string; user_id: string; role: WorkspaceRole; joined_at: string };
        Insert: { workspace_id: string; user_id: string; role?: WorkspaceRole; joined_at?: string };
        Update: { role?: WorkspaceRole };
        Relationships: [
          { foreignKeyName: "workspace_members_workspace_id_fkey"; columns: ["workspace_id"]; isOneToOne: false; referencedRelation: "workspaces"; referencedColumns: ["id"] },
          { foreignKeyName: "workspace_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      projects: {
        Row: { id: string; workspace_id: string; name: string; description: string | null; color: string; public_status_enabled: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; workspace_id: string; name: string; description?: string | null; color?: string; public_status_enabled?: boolean; created_at?: string; updated_at?: string };
        Update: { name?: string; description?: string | null; color?: string; public_status_enabled?: boolean; updated_at?: string };
        Relationships: [{ foreignKeyName: "projects_workspace_id_fkey"; columns: ["workspace_id"]; isOneToOne: false; referencedRelation: "workspaces"; referencedColumns: ["id"] }];
      };
      monitors: {
        Row: { id: string; project_id: string; name: string; url: string; method: string; interval_seconds: number; timeout_ms: number; expected_status_codes: number[]; headers: Json; status: MonitorStatus; is_active: boolean; last_checked_at: string | null; next_check_at: string | null; consecutive_failures: number; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; project_id: string; name: string; url: string; method?: string; interval_seconds?: number; timeout_ms?: number; expected_status_codes?: number[]; headers?: Json; status?: MonitorStatus; is_active?: boolean; last_checked_at?: string | null; next_check_at?: string | null; consecutive_failures?: number; created_by?: string | null; created_at?: string; updated_at?: string };
        Update: { name?: string; url?: string; method?: string; interval_seconds?: number; timeout_ms?: number; expected_status_codes?: number[]; headers?: Json; status?: MonitorStatus; is_active?: boolean; last_checked_at?: string | null; next_check_at?: string | null; consecutive_failures?: number; updated_at?: string };
        Relationships: [{ foreignKeyName: "monitors_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      ping_logs: {
        Row: { id: string; request_id: string; monitor_id: string; status: PingStatus; http_status: number | null; latency_ms: number; payload_size_bytes: number | null; response_headers: Json; error_message: string | null; response_excerpt: string | null; checked_at: string };
        Insert: { id?: string; request_id?: string; monitor_id: string; status: PingStatus; http_status?: number | null; latency_ms: number; payload_size_bytes?: number | null; response_headers?: Json; error_message?: string | null; response_excerpt?: string | null; checked_at?: string };
        Update: Partial<{ status: PingStatus; http_status: number | null; latency_ms: number; payload_size_bytes: number | null; response_headers: Json; error_message: string | null; response_excerpt: string | null }>;
        Relationships: [{ foreignKeyName: "ping_logs_monitor_id_fkey"; columns: ["monitor_id"]; isOneToOne: false; referencedRelation: "monitors"; referencedColumns: ["id"] }];
      };
      incidents: {
        Row: { id: string; project_id: string; monitor_id: string | null; title: string; summary: string | null; status: IncidentStatus; severity: IncidentSeverity; root_cause_notes: string | null; resolution_notes: string | null; started_at: string; resolved_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; project_id: string; monitor_id?: string | null; title: string; summary?: string | null; status?: IncidentStatus; severity?: IncidentSeverity; root_cause_notes?: string | null; resolution_notes?: string | null; started_at?: string; resolved_at?: string | null; created_at?: string; updated_at?: string };
        Update: { monitor_id?: string | null; title?: string; summary?: string | null; status?: IncidentStatus; severity?: IncidentSeverity; root_cause_notes?: string | null; resolution_notes?: string | null; resolved_at?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "incidents_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      incident_updates: {
        Row: { id: string; incident_id: string; previous_status: IncidentStatus | null; new_status: IncidentStatus; message: string | null; created_by: string | null; created_at: string };
        Insert: { id?: string; incident_id: string; previous_status?: IncidentStatus | null; new_status: IncidentStatus; message?: string | null; created_by?: string | null; created_at?: string };
        Update: never;
        Relationships: [{ foreignKeyName: "incident_updates_incident_id_fkey"; columns: ["incident_id"]; isOneToOne: false; referencedRelation: "incidents"; referencedColumns: ["id"] }];
      };
      alert_channels: {
        Row: { id: string; workspace_id: string; project_id: string | null; type: AlertChannelType; name: string; destination: string; encrypted_secret: string | null; is_active: boolean; on_down: boolean; on_recovery: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; workspace_id: string; project_id?: string | null; type: AlertChannelType; name: string; destination: string; encrypted_secret?: string | null; is_active?: boolean; on_down?: boolean; on_recovery?: boolean; created_at?: string; updated_at?: string };
        Update: { project_id?: string | null; type?: AlertChannelType; name?: string; destination?: string; encrypted_secret?: string | null; is_active?: boolean; on_down?: boolean; on_recovery?: boolean; updated_at?: string };
        Relationships: [{ foreignKeyName: "alert_channels_workspace_id_fkey"; columns: ["workspace_id"]; isOneToOne: false; referencedRelation: "workspaces"; referencedColumns: ["id"] }];
      };
      alert_deliveries: {
        Row: { id: string; incident_id: string | null; channel_id: string; event_type: string; status: AlertDeliveryStatus; payload: Json; error_message: string | null; attempted_at: string; delivered_at: string | null };
        Insert: { id?: string; incident_id?: string | null; channel_id: string; event_type: string; status?: AlertDeliveryStatus; payload?: Json; error_message?: string | null; attempted_at?: string; delivered_at?: string | null };
        Update: { status?: AlertDeliveryStatus; payload?: Json; error_message?: string | null; delivered_at?: string | null };
        Relationships: [{ foreignKeyName: "alert_deliveries_channel_id_fkey"; columns: ["channel_id"]; isOneToOne: false; referencedRelation: "alert_channels"; referencedColumns: ["id"] }];
      };
      api_collections: {
        Row: { id: string; project_id: string; name: string; description: string | null; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; project_id: string; name: string; description?: string | null; created_by?: string | null; created_at?: string; updated_at?: string };
        Update: { name?: string; description?: string | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "api_collections_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      api_requests: {
        Row: { id: string; collection_id: string; name: string; method: string; url: string; query_params: Json; headers: Json; auth: Json; body: Json | null; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; collection_id: string; name: string; method: string; url: string; query_params?: Json; headers?: Json; auth?: Json; body?: Json | null; created_by?: string | null; created_at?: string; updated_at?: string };
        Update: { name?: string; method?: string; url?: string; query_params?: Json; headers?: Json; auth?: Json; body?: Json | null; updated_at?: string };
        Relationships: [{ foreignKeyName: "api_requests_collection_id_fkey"; columns: ["collection_id"]; isOneToOne: false; referencedRelation: "api_collections"; referencedColumns: ["id"] }];
      };
      api_runs: {
        Row: { id: string; request_id: string | null; project_id: string; request_id_header: string; method: string; url: string; http_status: number | null; latency_ms: number | null; payload_size_bytes: number | null; request_headers: Json; response_headers: Json; response_body: Json | null; error_message: string | null; executed_by: string | null; executed_at: string };
        Insert: { id?: string; request_id?: string | null; project_id: string; request_id_header?: string; method: string; url: string; http_status?: number | null; latency_ms?: number | null; payload_size_bytes?: number | null; request_headers?: Json; response_headers?: Json; response_body?: Json | null; error_message?: string | null; executed_by?: string | null; executed_at?: string };
        Update: never;
        Relationships: [{ foreignKeyName: "api_runs_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      security_scans: {
        Row: { id: string; project_id: string; domain: string; resolved_ip: string | null; security_score: number; grade: SecurityGrade; certificate: Json; headers: Json; findings: Json; raw_result: Json | null; scanned_by: string | null; scanned_at: string };
        Insert: { id?: string; project_id: string; domain: string; resolved_ip?: string | null; security_score: number; grade: SecurityGrade; certificate?: Json; headers?: Json; findings?: Json; raw_result?: Json | null; scanned_by?: string | null; scanned_at?: string };
        Update: never;
        Relationships: [{ foreignKeyName: "security_scans_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      ai_diagnoses: {
        Row: { id: string; project_id: string; incident_id: string | null; monitor_id: string | null; api_run_id: string | null; security_scan_id: string | null; model: string; severity: IncidentSeverity; root_cause: string; recommended_fix: string; supporting_evidence: Json; created_by: string | null; created_at: string };
        Insert: { id?: string; project_id: string; incident_id?: string | null; monitor_id?: string | null; api_run_id?: string | null; security_scan_id?: string | null; model: string; severity: IncidentSeverity; root_cause: string; recommended_fix: string; supporting_evidence?: Json; created_by?: string | null; created_at?: string };
        Update: never;
        Relationships: [{ foreignKeyName: "ai_diagnoses_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }];
      };
      activity_events: {
        Row: { id: string; workspace_id: string; project_id: string | null; type: ActivityType; title: string; metadata: Json; actor_id: string | null; created_at: string };
        Insert: { id?: string; workspace_id: string; project_id?: string | null; type: ActivityType; title: string; metadata?: Json; actor_id?: string | null; created_at?: string };
        Update: never;
        Relationships: [{ foreignKeyName: "activity_events_workspace_id_fkey"; columns: ["workspace_id"]; isOneToOne: false; referencedRelation: "workspaces"; referencedColumns: ["id"] }];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_workspace: { Args: { workspace_name: string; workspace_slug: string }; Returns: string };
      is_workspace_member: { Args: { target_workspace_id: string; allowed_roles?: WorkspaceRole[] }; Returns: boolean };
      can_access_project: { Args: { target_project_id: string }; Returns: boolean };
      can_access_monitor: { Args: { target_monitor_id: string }; Returns: boolean };
      is_workspace_owner: { Args: { target_workspace_id: string }; Returns: boolean };
      get_public_status: { Args: { target_slug: string }; Returns: unknown[] };
      cleanup_expired_demo_workspaces: { Args: Record<string, never>; Returns: number };
    };
    Enums: {
      workspace_role: WorkspaceRole;
      monitor_status: MonitorStatus;
      ping_status: PingStatus;
      incident_status: IncidentStatus;
      incident_severity: IncidentSeverity;
      security_grade: SecurityGrade;
      alert_channel_type: AlertChannelType;
      alert_delivery_status: AlertDeliveryStatus;
      activity_type: ActivityType;
    };
    CompositeTypes: Record<string, never>;
  };
}
