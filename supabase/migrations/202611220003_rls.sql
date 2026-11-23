alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.monitors enable row level security;
alter table public.ping_logs enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_updates enable row level security;
alter table public.alert_channels enable row level security;
alter table public.alert_deliveries enable row level security;
alter table public.api_collections enable row level security;
alter table public.api_requests enable row level security;
alter table public.api_runs enable row level security;
alter table public.security_scans enable row level security;
alter table public.ai_diagnoses enable row level security;
alter table public.activity_events enable row level security;

create or replace function public.is_workspace_member(
  target_workspace_id uuid,
  allowed_roles workspace_role[] default array['owner','admin','member','viewer']::workspace_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
      and wm.role = any(allowed_roles)
  );
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = target_project_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_monitor(target_monitor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.monitors m
    join public.projects p on p.id = m.project_id
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where m.id = target_monitor_id
      and wm.user_id = auth.uid()
  );
$$;

create policy "profiles_self_select"
on public.profiles for select
using (id = auth.uid());

create policy "profiles_self_update"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "workspaces_member_select"
on public.workspaces for select
using (public.is_workspace_member(id));

create policy "workspaces_admin_update"
on public.workspaces for update
using (public.is_workspace_member(id, array['owner','admin']::workspace_role[]))
with check (public.is_workspace_member(id, array['owner','admin']::workspace_role[]));

create policy "workspace_members_member_select"
on public.workspace_members for select
using (public.is_workspace_member(workspace_id));

create policy "workspace_members_admin_manage"
on public.workspace_members for all
using (public.is_workspace_member(workspace_id, array['owner','admin']::workspace_role[]))
with check (public.is_workspace_member(workspace_id, array['owner','admin']::workspace_role[]));

create policy "projects_member_all"
on public.projects for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id, array['owner','admin','member']::workspace_role[]));

create policy "monitors_member_all"
on public.monitors for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "ping_logs_member_select"
on public.ping_logs for select
using (public.can_access_monitor(monitor_id));

create policy "incidents_member_all"
on public.incidents for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "incident_updates_member_select"
on public.incident_updates for select
using (exists (
  select 1
  from public.incidents i
  where i.id = incident_id
    and public.can_access_project(i.project_id)
));

create policy "incident_updates_member_insert"
on public.incident_updates for insert
with check (exists (
  select 1
  from public.incidents i
  join public.projects p on p.id = i.project_id
  where i.id = incident_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "alert_channels_member_all"
on public.alert_channels for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id, array['owner','admin','member']::workspace_role[]));

create policy "alert_deliveries_member_select"
on public.alert_deliveries for select
using (exists (
  select 1
  from public.alert_channels c
  where c.id = channel_id
    and public.is_workspace_member(c.workspace_id)
));

create policy "api_collections_member_all"
on public.api_collections for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "api_requests_member_all"
on public.api_requests for all
using (exists (
  select 1
  from public.api_collections c
  where c.id = collection_id
    and public.can_access_project(c.project_id)
))
with check (exists (
  select 1
  from public.api_collections c
  join public.projects p on p.id = c.project_id
  where c.id = collection_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "api_runs_member_all"
on public.api_runs for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "security_scans_member_all"
on public.security_scans for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "ai_diagnoses_member_all"
on public.ai_diagnoses for all
using (public.can_access_project(project_id))
with check (exists (
  select 1
  from public.projects p
  where p.id = project_id
    and public.is_workspace_member(p.workspace_id, array['owner','admin','member']::workspace_role[])
));

create policy "activity_events_member_select"
on public.activity_events for select
using (public.is_workspace_member(workspace_id));
