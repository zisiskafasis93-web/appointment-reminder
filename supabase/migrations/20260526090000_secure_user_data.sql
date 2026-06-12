begin;

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.clients enable row level security;
alter table public.message_logs enable row level security;

-- Replace any permissive development policies with a known production policy set.
do $$
declare
  item record;
begin
  for item in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'appointments', 'clients', 'message_logs')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      item.policyname,
      item.tablename
    );
  end loop;
end
$$;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy appointments_select_own
  on public.appointments for select
  to authenticated
  using (auth.uid() = user_id);

create policy appointments_insert_own
  on public.appointments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      client_id is null
      or exists (
        select 1
        from public.clients
        where clients.id = appointments.client_id
          and clients.user_id = auth.uid()
      )
    )
  );

create policy appointments_update_own
  on public.appointments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      client_id is null
      or exists (
        select 1
        from public.clients
        where clients.id = appointments.client_id
          and clients.user_id = auth.uid()
      )
    )
  );

create policy appointments_delete_own
  on public.appointments for delete
  to authenticated
  using (auth.uid() = user_id);

create policy clients_select_own
  on public.clients for select
  to authenticated
  using (auth.uid() = user_id);

create policy clients_insert_own
  on public.clients for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy clients_update_own
  on public.clients for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy clients_delete_own
  on public.clients for delete
  to authenticated
  using (auth.uid() = user_id);

-- Reminders are recorded by the trusted server process; the user only reads logs.
create policy message_logs_select_own
  on public.message_logs for select
  to authenticated
  using (auth.uid() = user_id);

commit;
