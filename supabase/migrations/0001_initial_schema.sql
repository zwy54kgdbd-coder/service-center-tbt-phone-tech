create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  fulfillment_method text not null default 'pickup' check (fulfillment_method in ('pickup', 'delivery')),
  total_cents integer not null default 0 check (total_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Profiles can read own profile"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Profiles can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public can read active products"
on public.products for select
using (is_active = true or public.is_admin());

create policy "Admins can manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Customers can create orders"
on public.orders for insert
with check (customer_id is null or customer_id = auth.uid());

create policy "Customers can read own orders"
on public.orders for select
using (customer_id = auth.uid() or public.is_admin());

create policy "Admins can update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create policy "Order items readable with order"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
  )
);

create policy "Order items insertable with order"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.customer_id = auth.uid() or orders.customer_id is null)
  )
);
