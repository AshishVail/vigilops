create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict(id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger monitors_updated_at
before update on public.monitors
for each row execute function public.set_updated_at();

create trigger incidents_updated_at
before update on public.incidents
for each row execute function public.set_updated_at();

create trigger alert_channels_updated_at
before update on public.alert_channels
for each row execute function public.set_updated_at();

create trigger api_collections_updated_at
before update on public.api_collections
for each row execute function public.set_updated_at();

create trigger api_requests_updated_at
before update on public.api_requests
for each row execute function public.set_updated_at();
