create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists clients_user_name_phone_key
  on public.clients (user_id, name, phone);

alter table public.appointments
  add column if not exists client_id uuid references public.clients(id) on delete set null;

create index if not exists appointments_client_id_idx
  on public.appointments (client_id);

alter table public.clients enable row level security;

drop policy if exists "Users can read their clients" on public.clients;
create policy "Users can read their clients"
  on public.clients for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their clients" on public.clients;
create policy "Users can insert their clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their clients" on public.clients;
create policy "Users can update their clients"
  on public.clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_clients_updated_at on public.clients;
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_clients_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();
