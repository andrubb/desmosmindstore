-- ════════════════════════════════════════════════════════════
-- Desmos Mind — Supabase schema additions
-- Run these once in the Supabase SQL editor.
-- ════════════════════════════════════════════════════════════

-- ─── Drops table — homepage slider ───
-- IMPORTANT: column is `descripcion`, not `desc` (SQL reserved word).
create table if not exists drops (
  id          bigserial primary key,
  tag         text,
  fecha       text,
  titulo      text,
  descripcion text,
  img         text,
  cta         text,
  cta_link    text,
  position    int default 0,
  active      boolean default true,
  created_at  timestamptz default now()
);
-- If the table was created earlier with a `desc` column, this migrates it.
alter table drops add column if not exists descripcion text;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name='drops' and column_name='desc'
  ) then
    execute 'update drops set descripcion = coalesce(descripcion, "desc") where descripcion is null';
    execute 'alter table drops drop column "desc"';
  end if;
end$$;

alter table drops enable row level security;
drop policy if exists "drops public read" on drops;
create policy "drops public read" on drops for select using (true);
drop policy if exists "drops anon write" on drops;
create policy "drops anon write" on drops for all to anon using (true) with check (true);

-- ─── Reviews / testimonials ───
create table if not exists reviews (
  id         bigserial primary key,
  name       text not null,
  location   text,
  rating     int default 5 check (rating between 1 and 5),
  text       text not null,
  verified   boolean default true,
  initials   text,
  position   int default 0,
  active     boolean default true,
  created_at timestamptz default now()
);
alter table reviews enable row level security;
drop policy if exists "reviews public read" on reviews;
create policy "reviews public read" on reviews for select using (active = true);
drop policy if exists "reviews anon write" on reviews;
create policy "reviews anon write" on reviews for all to anon using (true) with check (true);

-- ─── Categories ───
create table if not exists categories (
  id         bigserial primary key,
  slug       text unique not null,
  name       text not null,
  img        text,
  count_text text,
  cta_text   text default 'Ver colección',
  filter     text,
  position   int default 0,
  active     boolean default true,
  created_at timestamptz default now()
);
alter table categories enable row level security;
drop policy if exists "categories public read" on categories;
create policy "categories public read" on categories for select using (active = true);
drop policy if exists "categories anon write" on categories;
create policy "categories anon write" on categories for all to anon using (true) with check (true);

-- ─── Storage bucket for admin image uploads ───
-- 1) Dashboard → Storage → New bucket → name: `product-images` → make PUBLIC
-- 2) Run the following policies in the SQL editor:
--
--   insert into storage.buckets (id, name, public)
--   values ('product-images', 'product-images', true)
--   on conflict (id) do update set public = true;
--
--   drop policy if exists "anon read product-images" on storage.objects;
--   create policy "anon read product-images"
--     on storage.objects for select to anon
--     using (bucket_id = 'product-images');
--
--   drop policy if exists "anon write product-images" on storage.objects;
--   create policy "anon write product-images"
--     on storage.objects for insert to anon
--     with check (bucket_id = 'product-images');
--
--   drop policy if exists "anon update product-images" on storage.objects;
--   create policy "anon update product-images"
--     on storage.objects for update to anon
--     using (bucket_id = 'product-images');
-- ─────────────────────────────────────────────────────────────

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

-- ─── User profiles for cross-device wishlist + cart sync ───
-- Linked to Supabase Auth users (magic link sign-in).
create table if not exists user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  wishlist   jsonb default '[]'::jsonb,
  cart_items jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
create index if not exists user_profiles_updated_at_idx
  on user_profiles(updated_at desc);

alter table user_profiles enable row level security;

drop policy if exists "user reads own profile" on user_profiles;
create policy "user reads own profile"
  on user_profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "user inserts own profile" on user_profiles;
create policy "user inserts own profile"
  on user_profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "user updates own profile" on user_profiles;
create policy "user updates own profile"
  on user_profiles for update to authenticated
  using (auth.uid() = id);

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
