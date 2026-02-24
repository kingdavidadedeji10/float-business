-- ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- OWNERS TABLE
create table owners (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- STORES TABLE
create table stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references owners(id) on delete cascade,
  name text not null,
  slug text unique not null,
  theme_id text not null,
  subaccount_code text,
  created_at timestamp with time zone default now()
);

-- PRODUCTS TABLE
create table products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id) on delete cascade,
  name text not null,
  price numeric not null,
  image_url text,
  description text,
  created_at timestamp with time zone default now()
);

-- ORDERS TABLE
create table orders (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id) on delete cascade,
  product_id uuid references products(id),
  buyer_email text not null,
  amount numeric not null,
  payment_status text not null,
  created_at timestamp with time zone default now()
);

-- CHAT SESSIONS (placeholder)
create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id),
  owner_id uuid references owners(id),
  user_id text,
  messages jsonb,
  created_at timestamp with time zone default now()
);

-- ENABLE RLS
alter table stores enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

-- RLS POLICIES

-- Stores: owner can manage their stores
create policy "Owner can manage own stores" on stores
for all
using (owner_id = auth.uid());

-- Products: owner can manage products in their stores
create policy "Owner can manage own store products" on products
for all
using (
  store_id in (select id from stores where owner_id = auth.uid())
);

-- Orders: owner can see orders of their stores
create policy "Owner can view orders for their stores" on orders
for select
using (
  store_id in (select id from stores where owner_id = auth.uid())
);
