create or replace function public.consult_accepted()
returns trigger
language plpgsql
security definer
as $$
begin
    -- if new.status = 'accepted' then
    perform realtime.broadcast_changes(
        'consults',
        tg_op,
        tg_op,
        tg_table_name,
        tg_table_schema,
        new,
        old
    );
    raise warning 'after calling broadcast_changes';
    return null;
end;
$$;

create trigger broadcast_changes_for_consult_accepted
after update on public.consult
for each row execute function public.consult_accepted();

create policy "Patients can listen to doctor accepted event" on realtime.messages for
select
    to authenticated using(
        realtime.topic() = (select auth.uid())
    );

    create view public.consult_view as
select *,
       coalesce(requested_at, '1970-01-01'::date) as requested_or_early
from public.consult;
