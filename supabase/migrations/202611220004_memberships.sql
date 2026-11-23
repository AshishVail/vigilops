create or replace function public.create_workspace(
  workspace_name text,
  workspace_slug text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.workspaces(name, slug, owner_id)
  values (workspace_name, workspace_slug, auth.uid())
  returning id into new_workspace_id;

  insert into public.workspace_members(workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');

  return new_workspace_id;
end;
$$;

revoke all on function public.create_workspace(text, text) from public;
grant execute on function public.create_workspace(text, text) to authenticated;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;
