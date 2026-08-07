-- ===========================================================
-- Azure Bloom — Supabase Schema
-- Paste this entire block into the Supabase SQL Editor and
-- click "Run". Safe to re-run (uses IF NOT EXISTS / OR REPLACE).
-- ===========================================================


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES  (one row per auth.users row)
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  loyalty_pts  integer     not null default 0,
  notif_promo  boolean     not null default true,
  notif_order  boolean     not null default true,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Drop existing policies so re-runs are idempotent
drop policy if exists "profiles_select_own"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_insert_own"  on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can upsert their own row (needed for the client-side profile refresh)
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: create / refresh profile whenever a user signs up.
-- Uses DO UPDATE so that display_name and avatar_url stay in sync with
-- the OAuth provider even if the user changes their Google profile.
-- loyalty_pts and notif settings are intentionally excluded so they
-- are never overwritten by a re-login.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        avatar_url   = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 2. ORDERS
-- ────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  confirmation_code text        not null,
  status            text        not null default 'processing'
                                check (status in ('processing','ready','picked_up','cancelled')),
  subtotal          numeric(10,2) not null,
  discount_amt      numeric(10,2) not null default 0,
  tax               numeric(10,2) not null,
  total             numeric(10,2) not null,
  promo_code        text,
  created_at        timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 3. ORDER ITEMS
-- ────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id         uuid        primary key default gen_random_uuid(),
  order_id   uuid        not null references public.orders(id) on delete cascade,
  product_id text        not null,
  name       text        not null,
  brand      text,
  price      numeric(10,2) not null,
  qty        integer     not null default 1
);

alter table public.order_items enable row level security;

drop policy if exists "order_items_select_own" on public.order_items;
drop policy if exists "order_items_insert_own" on public.order_items;

create policy "order_items_select_own"
  on public.order_items for select
  using (
    auth.uid() = (select user_id from public.orders where id = order_items.order_id)
  );

create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    auth.uid() = (select user_id from public.orders where id = order_items.order_id)
  );


-- ────────────────────────────────────────────────────────────
-- 4. FAVOURITES
-- ────────────────────────────────────────────────────────────
create table if not exists public.favourites (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  product_id text        not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.favourites enable row level security;

drop policy if exists "favourites_select_own" on public.favourites;
drop policy if exists "favourites_insert_own" on public.favourites;
drop policy if exists "favourites_delete_own" on public.favourites;

create policy "favourites_select_own"
  on public.favourites for select
  using (auth.uid() = user_id);

create policy "favourites_insert_own"
  on public.favourites for insert
  with check (auth.uid() = user_id);

create policy "favourites_delete_own"
  on public.favourites for delete
  using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- INDEXES — keep every per-user query fast as rows accumulate
-- ────────────────────────────────────────────────────────────
create index if not exists idx_orders_user_id
  on public.orders (user_id);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_favourites_user_id
  on public.favourites (user_id);


-- ────────────────────────────────────────────────────────────
-- 5. LOYALTY TRANSACTIONS  (audit trail for every point change)
-- ────────────────────────────────────────────────────────────
-- Points system:
--   Earn  : 1 pt per $1 spent on pre-tax subtotal (floor)
--   Redeem: 500 pts = $10 off  (type = 'redeem')
--   Expire: future use         (type = 'expire')
--
-- Average order ~$50 → 50 pts → 10 orders to first $10 redemption.
-- 30 orders → 3 × $10 = $30 ≈ one mid-range product free.
-- ────────────────────────────────────────────────────────────
create table if not exists public.loyalty_transactions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  order_id   uuid        references public.orders(id) on delete set null,
  type       text        not null check (type in ('earn', 'redeem', 'adjust', 'expire')),
  pts        integer     not null,            -- positive = earn, negative = redeem/expire
  balance    integer     not null,            -- running balance after this transaction
  note       text,
  created_at timestamptz not null default now()
);

alter table public.loyalty_transactions enable row level security;

drop policy if exists "loyalty_tx_select_own" on public.loyalty_transactions;
drop policy if exists "loyalty_tx_insert_own" on public.loyalty_transactions;

create policy "loyalty_tx_select_own"
  on public.loyalty_transactions for select
  using (auth.uid() = user_id);

create policy "loyalty_tx_insert_own"
  on public.loyalty_transactions for insert
  with check (auth.uid() = user_id);

create index if not exists idx_loyalty_tx_user_id
  on public.loyalty_transactions (user_id);

create index if not exists idx_loyalty_tx_order_id
  on public.loyalty_transactions (order_id)
  where order_id is not null;


-- ────────────────────────────────────────────────────────────
-- 6. ATOMIC LOYALTY INCREMENT RPC
--    Called after a successful order so points are always
--    consistent even if the client retries.
-- ────────────────────────────────────────────────────────────
create or replace function public.award_loyalty_pts(
  p_user_id  uuid,
  p_order_id uuid,
  p_pts      integer
)
returns integer          -- returns the new balance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  -- Security: callers may only award points to themselves
  if auth.uid() is distinct from p_user_id then
    raise exception 'unauthorized: may only award points to your own profile';
  end if;

  -- Idempotency: skip if a transaction for this order already exists
  if exists (
    select 1 from public.loyalty_transactions
    where order_id = p_order_id and type = 'earn'
  ) then
    select loyalty_pts into v_new_balance
    from public.profiles
    where id = p_user_id;
    return v_new_balance;
  end if;

  -- Atomically increment the balance
  update public.profiles
  set loyalty_pts = loyalty_pts + p_pts
  where id = p_user_id
  returning loyalty_pts into v_new_balance;

  -- Record the transaction
  insert into public.loyalty_transactions (user_id, order_id, type, pts, balance, note)
  values (p_user_id, p_order_id, 'earn', p_pts, v_new_balance,
          'Earned on order ' || p_order_id::text);

  return v_new_balance;
end;
$$;
