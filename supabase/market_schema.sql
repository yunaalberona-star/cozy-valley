-- Cozy Valley Market Board schema (run in Supabase SQL editor)

create table if not exists market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  seller_name text not null,
  item_kind text not null check (item_kind in ('goods', 'seeds', 'materials')),
  item_id text not null,
  quantity int not null check (quantity > 0),
  price_per_unit int not null check (price_per_unit > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'sold', 'cancelled'))
);

create table if not exists market_payouts (
  id uuid primary key default gen_random_uuid(),
  seller_id text not null,
  amount int not null check (amount > 0),
  listing_id uuid references market_listings(id),
  created_at timestamptz not null default now(),
  claimed boolean not null default false
);

create index if not exists market_listings_active_idx
  on market_listings (status, expires_at)
  where status = 'active';

create index if not exists market_payouts_seller_unclaimed_idx
  on market_payouts (seller_id)
  where claimed = false;

alter table market_listings enable row level security;
alter table market_payouts enable row level security;

-- Open policies for tester MVP (tighten before production)
create policy "market_listings_select" on market_listings
  for select using (true);

create policy "market_listings_insert" on market_listings
  for insert with check (true);

create policy "market_listings_update" on market_listings
  for update using (true);

create policy "market_payouts_select" on market_payouts
  for select using (true);

create policy "market_payouts_insert" on market_payouts
  for insert with check (true);

create policy "market_payouts_update" on market_payouts
  for update using (true);

-- Farmer chat (same Supabase project as the market)
create table if not exists market_chat (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

create index if not exists market_chat_created_idx
  on market_chat (created_at desc);

alter table market_chat enable row level security;

drop policy if exists "market_chat_select" on market_chat;
create policy "market_chat_select" on market_chat
  for select using (true);

drop policy if exists "market_chat_insert" on market_chat;
create policy "market_chat_insert" on market_chat
  for insert with check (true);

-- Goal ranking (daily / weekly all-complete finish order)
create table if not exists goal_ranking_entries (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  player_name text not null,
  period_kind text not null check (period_kind in ('daily', 'weekly')),
  period_key text not null,
  completed_at timestamptz not null default now(),
  unique (player_id, period_kind, period_key)
);

create index if not exists goal_ranking_period_time_idx
  on goal_ranking_entries (period_kind, period_key, completed_at);

alter table goal_ranking_entries enable row level security;

drop policy if exists "goal_ranking_select" on goal_ranking_entries;
create policy "goal_ranking_select" on goal_ranking_entries
  for select using (true);

drop policy if exists "goal_ranking_insert" on goal_ranking_entries;
create policy "goal_ranking_insert" on goal_ranking_entries
  for insert with check (true);

create or replace function submit_goal_ranking(
  p_player_id text,
  p_player_name text,
  p_period_kind text,
  p_period_key text
)
returns json
language plpgsql
as $$
declare
  v_completed_at timestamptz;
  v_rank bigint;
  v_total bigint;
begin
  insert into goal_ranking_entries (player_id, player_name, period_kind, period_key)
  values (p_player_id, p_player_name, p_period_kind, p_period_key)
  on conflict (player_id, period_kind, period_key) do nothing;

  select completed_at
  into v_completed_at
  from goal_ranking_entries
  where player_id = p_player_id
    and period_kind = p_period_kind
    and period_key = p_period_key;

  if v_completed_at is null then
    raise exception 'goal ranking insert failed';
  end if;

  select count(*)::bigint
  into v_rank
  from goal_ranking_entries
  where period_kind = p_period_kind
    and period_key = p_period_key
    and completed_at <= v_completed_at;

  select count(*)::bigint
  into v_total
  from goal_ranking_entries
  where period_kind = p_period_kind
    and period_key = p_period_key;

  return json_build_object('rank', v_rank, 'total', v_total);
end;
$$;
