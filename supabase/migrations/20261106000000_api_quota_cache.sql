-- Milestone 49: shared cache + usage counters for paid flight APIs
-- (Sky Scrapper 200/month, SerpApi 250/month). Server-only: RLS on, no
-- policies, functions callable by service_role only.

create table if not exists public.api_usage (
  provider text not null,
  day date not null,
  count integer not null default 0,
  primary key (provider, day)
);

create table if not exists public.api_visitors (
  visitor text not null,
  day date not null,
  count integer not null default 0,
  primary key (visitor, day)
);

create table if not exists public.api_cache (
  key text primary key,
  value jsonb not null,
  expires_at timestamptz not null
);

alter table public.api_usage enable row level security;
alter table public.api_visitors enable row level security;
alter table public.api_cache enable row level security;

-- Atomically take one call from a provider's daily and monthly allowance.
create or replace function public.claim_api_call(p_provider text, p_daily integer, p_monthly integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'utc')::date;
  used_day integer;
  used_month integer;
begin
  perform pg_advisory_xact_lock(hashtext('api_usage:' || p_provider));
  select coalesce(sum(count), 0) into used_month
    from api_usage where provider = p_provider and day >= date_trunc('month', d)::date;
  select coalesce(max(count), 0) into used_day
    from api_usage where provider = p_provider and day = d;
  if used_day >= p_daily or used_month >= p_monthly then
    return false;
  end if;
  insert into api_usage (provider, day, count) values (p_provider, d, 1)
    on conflict (provider, day) do update set count = api_usage.count + 1;
  return true;
end;
$$;

-- Atomically count one paid lookup for a visitor (hashed IP), per day.
create or replace function public.claim_api_visitor(p_visitor text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'utc')::date;
  used integer;
begin
  perform pg_advisory_xact_lock(hashtext('api_visitor:' || p_visitor));
  select coalesce(max(count), 0) into used from api_visitors where visitor = p_visitor and day = d;
  if used >= p_limit then
    return false;
  end if;
  insert into api_visitors (visitor, day, count) values (p_visitor, d, 1)
    on conflict (visitor, day) do update set count = api_visitors.count + 1;
  delete from api_visitors where day < d - 2;
  return true;
end;
$$;

revoke all on function public.claim_api_call(text, integer, integer) from public, anon, authenticated;
revoke all on function public.claim_api_visitor(text, integer) from public, anon, authenticated;
grant execute on function public.claim_api_call(text, integer, integer) to service_role;
grant execute on function public.claim_api_visitor(text, integer) to service_role;
