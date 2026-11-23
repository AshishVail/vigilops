begin;
select plan(5);

select has_table('public', 'incidents', 'incidents table exists');
select has_table('public', 'incident_updates', 'incident updates table exists');
select has_type('public', 'incident_status', 'incident status enum exists');
select col_is_fk('public', 'incident_updates', 'incident_id', 'public', 'incidents', 'id', 'updates reference incidents');
select has_index('public', 'incidents', 'incidents_project_status_idx', array['project_id','status'], 'incident status index exists');

select * from finish();
rollback;
