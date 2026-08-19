-- Glooconn initial schema
-- Migrated from supabase/schema.sql for Supabase CLI migrations support.

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  search_data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_trips_user_id_idx on public.saved_trips (user_id);

alter table public.saved_trips enable row level security;

create policy "Users can view own trips"
  on public.saved_trips
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.saved_trips
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.saved_trips
  for delete
  using (auth.uid() = user_id);

-- Grant table-level permissions to the authenticated role so PostgREST can
-- execute DML. RLS policies still restrict which rows are accessible.
-- The anon role intentionally receives no grants — unauthenticated callers
-- cannot touch this table at all.
grant select, insert, delete on public.saved_trips to authenticated;
