create or replace function public.get_public_status(target_slug text)
returns table (
  workspace_name text,
  workspace_slug text,
  monitor_id uuid,
  monitor_name text,
  monitor_status monitor_status,
  last_checked_at timestamptz,
  average_latency_ms numeric,
  uptime_percent_30d numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    w.name,
    w.slug,
    m.id,
    m.name,
    m.status,
    m.last_checked_at,
    round(avg(p.latency_ms)::numeric, 0),
    round(
      (
        count(*) filter (
          where p.status = 'success'
            and p.checked_at >= now() - interval '30 days'
        )::numeric
        / nullif(count(*) filter (
          where p.checked_at >= now() - interval '30 days'
        ), 0)::numeric
      ) * 100,
      2
    )
  from public.workspaces w
  join public.projects pr on pr.workspace_id = w.id
  join public.monitors m on m.project_id = pr.id
  left join public.ping_logs p
    on p.monitor_id = m.id
  where w.slug = target_slug
    and w.public_status_enabled = true
    and pr.public_status_enabled = true
    and m.is_active = true
  group by w.name, w.slug, m.id, m.name, m.status, m.last_checked_at;
$$;

revoke all on function public.get_public_status(text) from public;
grant execute on function public.get_public_status(text) to anon, authenticated;
