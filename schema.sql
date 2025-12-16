-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CATEGORIES TABLE
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null default 0,
  sale_price numeric,
  stock integer not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  images text[] default array[]::text[],
  is_featured boolean default false,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCT VARIANTS TABLE
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  name text not null, -- e.g. "Color", "Size"
  options text[] default array[]::text[], -- e.g. ["Red", "Blue"]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid, -- Can reference auth.users if we use Supabase Auth later, or just store a string for guest checkout
  status text not null default 'pending', -- pending, processing, shipped, delivered, cancelled
  total numeric not null default 0,
  shipping_address jsonb, -- Store full address snapshot
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  price numeric not null, -- Price at time of purchase
  variant_selection jsonb -- e.g. {"Color": "Red"}
);

-- PROFILES (for admins/users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text, -- Added for Google Auth profile sync
  role text default 'customer', -- 'admin' or 'customer'
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple setup for now)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- Public read access for products and categories
create policy "Allow public read access on categories" on public.categories for select using (true);
create policy "Allow public read access on products" on public.products for select using (true);
create policy "Allow public read access on product_variants" on public.product_variants for select using (true);

-- Admin write access (Assuming you manually set your user role to 'admin' in profiles)
-- For simplicity in development, we might allow authenticated users to write, OR strictly check profile role.
-- Here is a policy relying on a 'role' column in profiles:
-- create policy "Allow admins to insert products" on public.products for insert with check (
--   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
-- );

-- STORAGE BUCKETS
-- You will need to create a 'products' bucket in Supabase Storage manually or via UI.
