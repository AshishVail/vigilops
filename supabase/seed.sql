begin;

insert into storage.buckets (id, name, public)
values ('vigilops-assets', 'vigilops-assets', false)
on conflict (id) do nothing;

commit;
