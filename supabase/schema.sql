-- ════════════════════════════════════════════════════════════
-- Desmos Mind — Supabase schema additions
-- Run these once in the Supabase SQL editor.
-- ════════════════════════════════════════════════════════════

-- ─── Real stock tracking on products ───
alter table products
  add column if not exists stock     integer,
  add column if not exists is_new    boolean default false,
  add column if not exists bestseller boolean default false;

-- Enable realtime so the storefront can subscribe to live stock changes.
alter publication supabase_realtime add table products;

-- ─── Orders ───
create table if not exists orders (
  id         uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  items      jsonb not null,
  total      numeric not null,
  status     text default 'pending',
  source     text default 'whatsapp',
  created_at timestamptz default now()
);
create index if not exists orders_order_code_idx on orders(order_code);
create index if not exists orders_status_created_idx on orders(status, created_at desc);

alter table orders enable row level security;
drop policy if exists "anon insert orders" on orders;
create policy "anon insert orders"
  on orders for insert to anon
  with check (true);
drop policy if exists "anon read orders" on orders;
create policy "anon read orders"
  on orders for select to anon
  using (true);

-- ─── Cart sessions for abandoned-cart reminders ───
create table if not exists cart_sessions (
  id             uuid primary key default gen_random_uuid(),
  client_id      text not null unique,
  email          text,
  cart_items     jsonb,
  cart_total     numeric,
  item_count     integer,
  status         text default 'active',          -- active | empty | reminded | completed
  last_active_at timestamptz default now(),
  reminded_at    timestamptz,
  created_at     timestamptz default now()
);
create index if not exists cart_sessions_client_id_idx on cart_sessions(client_id);
create index if not exists cart_sessions_abandoned_idx
  on cart_sessions(status, last_active_at)
  where email is not null and reminded_at is null;

alter table cart_sessions enable row level security;

-- Storefront upserts its own row via on_conflict=client_id
drop policy if exists "anon upsert cart session" on cart_sessions;
create policy "anon upsert cart session"
  on cart_sessions for insert to anon
  with check (true);

drop policy if exists "anon update cart session" on cart_sessions;
create policy "anon update cart session"
  on cart_sessions for update to anon
  using (true);

-- ─── Optional: schedule the abandoned-cart job ───
-- (Run in the Supabase Dashboard → Database → Cron, NOT here in SQL editor —
--  pg_cron extension must be enabled first.)
--
-- select cron.schedule(
--   'abandoned-cart-emails',
--   '0 * * * *',           -- every hour
--   $$
--     select net.http_post(
--       url := 'https://<PROJECT_REF>.functions.supabase.co/abandoned-cart-emails',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer <ANON_KEY_OR_CRON_SECRET>'
--       ),
--       body := '{}'::jsonb
--     );
--   $$
-- );
