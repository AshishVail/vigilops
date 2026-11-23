begin;
select plan(5);

select has_table('public', 'monitors', 'monitors table exists');
select has_table('public', 'ping_logs', 'ping_logs table exists');
select col_is_fk('public', 'ping_logs', 'monitor_id', 'public', 'monitors', 'id', 'ping logs reference monitors');
select has_index('public', 'monitors', 'monitors_next_check_idx', array['next_check_at'], 'due monitor index exists');
select has_function('public', 'can_access_monitor', array['uuid'], 'monitor access helper exists');

select * from finish();
rollback;
