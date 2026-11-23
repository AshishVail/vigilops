do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    alter publication supabase_realtime add table
      public.ping_logs,
      public.incidents,
      public.incident_updates,
      public.alert_deliveries,
      public.activity_events,
      public.monitors;
  end if;
end;
$$;
