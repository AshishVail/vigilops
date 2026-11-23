begin;
select plan(4);

select has_table('public', 'workspaces', 'workspaces table exists');
select has_table('public', 'workspace_members', 'workspace_members table exists');
select col_is_pk('public', 'workspace_members', array['workspace_id','user_id'], 'workspace_members composite key');
select has_function('public', 'is_workspace_member', array['uuid','workspace_role[]'], 'workspace membership helper exists');

select * from finish();
rollback;
