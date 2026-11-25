create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_workspace_id uuid;
  workspace_name text;
  workspace_slug text;
begin
  workspace_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(new.email, 'VigilOps User'), '@', 1), ''),
    'VigilOps User'
  );
  workspace_slug :=
    coalesce(nullif(trim(both '-' from regexp_replace(lower(workspace_name), '[^a-z0-9]+', '-', 'g')), ''), 'workspace')
    || '-' || replace(new.id::text, '-', '');

  insert into public.profiles(id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  insert into public.workspaces(name, slug, owner_id)
  values (workspace_name || ' Workspace', workspace_slug, new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members(workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  insert into public.projects(workspace_id, name, description, color)
  values (new_workspace_id, 'Core Platform', 'Default production observability project.', '#7C3AED');

  return new;
end;
$$;
