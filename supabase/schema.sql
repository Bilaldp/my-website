-- Lahore Bazaar — run in Supabase SQL Editor (single script)

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_name text not null,
  owner_name text,
  phone text,
  address text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  name text not null,
  price numeric not null,
  image_url text,
  description text,
  stock integer not null default 0,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  total numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id),
  quantity integer not null,
  price numeric not null
);

-- RLS
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Drop existing policies if re-running
drop policy if exists "vendors_own_all" on public.vendors;
drop policy if exists "products_public_read_approved" on public.products;
drop policy if exists "products_vendor_select_own" on public.products;
drop policy if exists "products_vendor_insert" on public.products;
drop policy if exists "products_vendor_update" on public.products;
drop policy if exists "products_vendor_delete" on public.products;
drop policy if exists "orders_any_insert" on public.orders;
drop policy if exists "orders_vendor_select" on public.orders;
drop policy if exists "orders_anon_select" on public.orders;
drop policy if exists "order_items_any_insert" on public.order_items;
drop policy if exists "order_items_vendor_select" on public.order_items;
drop policy if exists "order_items_anon_select" on public.order_items;

-- vendors: auth.uid() = user_id for all operations
create policy "vendors_own_all"
  on public.vendors
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- products: public read (approved shops only); vendors full CRUD on own rows
create policy "products_public_read_approved"
  on public.products
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.vendors v
      where v.id = products.vendor_id
        and v.approved = true
    )
  );

create policy "products_vendor_select_own"
  on public.products
  for select
  to authenticated
  using (
    vendor_id in (select id from public.vendors where user_id = auth.uid())
  );

create policy "products_vendor_insert"
  on public.products
  for insert
  to authenticated
  with check (
    vendor_id in (select id from public.vendors where user_id = auth.uid())
  );

create policy "products_vendor_update"
  on public.products
  for update
  to authenticated
  using (
    vendor_id in (select id from public.vendors where user_id = auth.uid())
  )
  with check (
    vendor_id in (select id from public.vendors where user_id = auth.uid())
  );

create policy "products_vendor_delete"
  on public.products
  for delete
  to authenticated
  using (
    vendor_id in (select id from public.vendors where user_id = auth.uid())
  );

-- orders: anyone inserts; vendors see orders that include their products
create policy "orders_any_insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

create policy "orders_vendor_select"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.vendors v on v.id = p.vendor_id
      where oi.order_id = orders.id
        and v.user_id = auth.uid()
    )
  );

-- Guest order confirmation (anon reads by id in app)
create policy "orders_anon_select"
  on public.orders
  for select
  to anon
  using (true);

-- order_items: anyone inserts (checkout); vendors read lines for their products
create policy "order_items_any_insert"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

create policy "order_items_vendor_select"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.products p
      join public.vendors v on v.id = p.vendor_id
      where p.id = order_items.product_id
        and v.user_id = auth.uid()
    )
  );

create policy "order_items_anon_select"
  on public.order_items
  for select
  to anon
  using (true);

-- Storage: product images bucket (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_vendor_insert" on storage.objects;
drop policy if exists "product_images_vendor_update" on storage.objects;
drop policy if exists "product_images_vendor_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

create policy "product_images_vendor_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.vendors where user_id = auth.uid()
    )
  );

create policy "product_images_vendor_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.vendors where user_id = auth.uid()
    )
  );

create policy "product_images_vendor_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.vendors where user_id = auth.uid()
    )
  );
