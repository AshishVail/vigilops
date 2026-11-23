create or replace function public.enforce_monitor_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id_for_project uuid;
  monitor_count integer;
begin
  select p.workspace_id
  into workspace_id_for_project
  from public.projects p
  where p.id = new.project_id;

  select count(*)
  into monitor_count
  from public.monitors m
  join public.projects p on p.id = m.project_id
  where p.workspace_id = workspace_id_for_project;

  if monitor_count >= 25 then
    raise exception 'A workspace cannot contain more than 25 monitors';
  end if;

  return new;
end;
$$;

create trigger monitors_limit_before_insert
before insert on public.monitors
for each row execute function public.enforce_monitor_limit();

create or replace function public.cleanup_expired_demo_workspaces()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.workspaces
  where is_demo = true
    and expires_at is not null
    and expires_at < now();

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_expired_demo_workspaces() from public;
grant execute on function public.cleanup_expired_demo_workspaces() to authenticated;
