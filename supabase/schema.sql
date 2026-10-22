create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon, authenticated;
grant usage on schema portfolio_private to service_role;
create table if not exists portfolio_private.request_budgets (
 bucket text primary key,
 requests integer not null default 0,
 expires_at timestamptz not null
);
alter table portfolio_private.request_budgets enable row level security;
grant select, insert, update, delete on portfolio_private.request_budgets to service_role;
drop policy if exists service_budget_access on portfolio_private.request_budgets;
create policy service_budget_access on portfolio_private.request_budgets to service_role using (true) with check (true);
create index if not exists request_budgets_expiry on portfolio_private.request_budgets(expires_at);
create or replace function public.consume_portfolio_budget(client_hash text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
 hour_start timestamptz := date_trunc('hour', now());
 day_start timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
 total integer;
 personal integer;
begin
 if client_hash !~ '^[0-9a-f]{64}$' then return false; end if;
 delete from portfolio_private.request_budgets where expires_at < now();
 insert into portfolio_private.request_budgets as b(bucket, requests, expires_at)
 values ('global:' || day_start::text, 1, day_start + interval '1 day')
 on conflict (bucket) do update set requests=b.requests+1 where b.requests < 300
 returning requests into total;
 if total is null then return false; end if;
 insert into portfolio_private.request_budgets as b(bucket, requests, expires_at)
 values ('client:' || client_hash || ':' || hour_start::text, 1, hour_start + interval '1 hour')
 on conflict (bucket) do update set requests=b.requests+1 where b.requests < 10
 returning requests into personal;
 return personal is not null;
end;
$$;
revoke all on function public.consume_portfolio_budget(text) from public, anon, authenticated;
grant execute on function public.consume_portfolio_budget(text) to service_role;
