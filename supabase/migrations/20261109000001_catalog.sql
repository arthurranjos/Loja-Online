create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '' check (char_length(description) <= 4000),
  price_cents bigint not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  size text not null check (char_length(btrim(size)) between 1 and 30),
  color text not null check (char_length(btrim(color)) between 1 and 50),
  sku text not null unique check (char_length(btrim(sku)) between 1 and 64),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_path text not null check (
    image_path ~ '^/products/[A-Za-z0-9._/-]+$'
    and position('..' in image_path) = 0
  ),
  alt_text text not null check (char_length(btrim(alt_text)) between 2 and 180),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, position)
);

create index products_active_category_idx on public.products (category_id, name) where active;
create index product_variants_product_active_idx on public.product_variants (product_id) where active;
create index product_images_product_position_idx on public.product_images (product_id, position);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

revoke all on public.categories, public.products, public.product_variants, public.product_images
  from anon, authenticated;
grant select on public.categories, public.products, public.product_images to anon, authenticated;

create policy "Public can read active categories"
on public.categories for select to anon, authenticated
using (active);

create policy "Public can read active products in active categories"
on public.products for select to anon, authenticated
using (
  active
  and exists (
    select 1 from public.categories c
    where c.id = category_id and c.active
  )
);

create policy "Public can read images for active products"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    join public.categories c on c.id = p.category_id
    where p.id = product_id and p.active and c.active
  )
);

create policy "Public can read active product variants"
on public.product_variants for select to anon, authenticated
using (
  active
  and exists (
    select 1
    from public.products p
    join public.categories c on c.id = p.category_id
    where p.id = product_id and p.active and c.active
  )
);

-- Expose only selectable variant attributes and a stock boolean, never the stock count or SKU.
create view public.catalog_product_variants
with (security_barrier = true)
as
select
  v.id,
  v.product_id,
  v.size,
  v.color,
  (v.stock_on_hand > 0) as available
from public.product_variants v
join public.products p on p.id = v.product_id
join public.categories c on c.id = p.category_id
where v.active and p.active and c.active;

revoke all on public.catalog_product_variants from anon, authenticated;
grant select on public.catalog_product_variants to anon, authenticated;
