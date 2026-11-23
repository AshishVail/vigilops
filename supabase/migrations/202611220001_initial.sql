create extension if not exists "pgcrypto";

create type workspace_role as enum ('owner', 'admin', 'member', 'viewer');
create type monitor_status as enum ('operating', 'degraded', 'down', 'paused');
create type ping_status as enum ('success', 'failure', 'timeout', 'error');
create type incident_status as enum ('investigating', 'identified', 'monitoring', 'resolved');
create type incident_severity as enum ('low', 'medium', 'high', 'critical');
create type security_grade as enum ('A+', 'A', 'B', 'C', 'D', 'F');
create type alert_channel_type as enum ('discord', 'slack', 'email');
create type alert_delivery_status as enum ('pending', 'succeeded', 'failed');
create type activity_type as enum (
  'monitor_created', 'monitor_updated', 'monitor_deleted', 'ping_completed',
  'incident_created', 'incident_updated', 'incident_resolved',
  'api_request_executed', 'security_scan_completed', 'alert_sent',
  'workspace_member_added'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  is_demo boolean not null default false,
  expires_at timestamptz,
  public_status_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#7C3AED',
  public_status_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.monitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  url text not null,
  method text not null default 'GET',
  interval_seconds integer not null default 300,
  timeout_ms integer not null default 10000,
  expected_status_codes integer[] not null default array[200],
  headers jsonb not null default '{}'::jsonb,
  status monitor_status not null default 'operating',
  is_active boolean not null default true,
  last_checked_at timestamptz,
  next_check_at timestamptz,
  consecutive_failures integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monitors_interval_check check (interval_seconds >= 300 and interval_seconds <= 86400),
  constraint monitors_timeout_check check (timeout_ms >= 1000 and timeout_ms <= 10000),
  constraint monitors_method_check check (method in ('GET','HEAD','POST','PUT','PATCH','DELETE'))
);

create table public.ping_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null default gen_random_uuid(),
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  status ping_status not null,
  http_status integer,
  latency_ms integer not null,
  payload_size_bytes integer,
  response_headers jsonb not null default '{}'::jsonb,
  error_message text,
  response_excerpt text,
  checked_at timestamptz not null default now(),
  constraint ping_latency_check check (latency_ms >= 0),
  constraint ping_payload_check check (payload_size_bytes is null or payload_size_bytes >= 0)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  monitor_id uuid references public.monitors(id) on delete set null,
  title text not null,
  summary text,
  status incident_status not null default 'investigating',
  severity incident_severity not null default 'medium',
  root_cause_notes text,
  resolution_notes text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  previous_status incident_status,
  new_status incident_status not null,
  message text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.alert_channels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  type alert_channel_type not null,
  name text not null,
  destination text not null,
  encrypted_secret text,
  is_active boolean not null default true,
  on_down boolean not null default true,
  on_recovery boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete set null,
  channel_id uuid not null references public.alert_channels(id) on delete cascade,
  event_type text not null,
  status alert_delivery_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  attempted_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table public.api_collections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.api_requests (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.api_collections(id) on delete cascade,
  name text not null,
  method text not null,
  url text not null,
  query_params jsonb not null default '[]'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  auth jsonb not null default '{}'::jsonb,
  body jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint api_requests_method_check check (method in ('GET','POST','PUT','PATCH','DELETE'))
);

create table public.api_runs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.api_requests(id) on delete set null,
  project_id uuid not null references public.projects(id) on delete cascade,
  request_id_header uuid not null default gen_random_uuid(),
  method text not null,
  url text not null,
  http_status integer,
  latency_ms integer,
  payload_size_bytes integer,
  request_headers jsonb not null default '{}'::jsonb,
  response_headers jsonb not null default '{}'::jsonb,
  response_body jsonb,
  error_message text,
  executed_by uuid references public.profiles(id),
  executed_at timestamptz not null default now()
);

create table public.security_scans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  domain text not null,
  resolved_ip text,
  security_score integer not null,
  grade security_grade not null,
  certificate jsonb not null default '{}'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  raw_result jsonb,
  scanned_by uuid references public.profiles(id),
  scanned_at timestamptz not null default now(),
  constraint security_score_range check (security_score between 0 and 100)
);

create table public.ai_diagnoses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  incident_id uuid references public.incidents(id) on delete set null,
  monitor_id uuid references public.monitors(id) on delete set null,
  api_run_id uuid references public.api_runs(id) on delete set null,
  security_scan_id uuid references public.security_scans(id) on delete set null,
  model text not null,
  severity incident_severity not null,
  root_cause text not null,
  recommended_fix text not null,
  supporting_evidence jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  type activity_type not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
