create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (cart_id, variant_id)
);

create index cart_items_variant_id_idx on public.cart_items (variant_id);

create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

revoke all on public.carts, public.cart_items from anon, authenticated;
grant select on public.carts, public.cart_items to authenticated;

create policy "Customers can read their own cart"
on public.carts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Customers can read their own cart items"
on public.cart_items for select to authenticated
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_id and c.user_id = (select auth.uid())
  )
);

create function public.ensure_cart()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select id into v_cart_id
  from public.carts
  where user_id = v_user_id;

  return v_cart_id;
end;
$$;

create function public.add_cart_item(p_variant_id uuid, p_quantity integer default 1)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_stock integer;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if p_quantity is null or p_quantity < 1 then
    raise exception 'A quantidade deve ser um inteiro positivo.' using errcode = '23514';
  end if;

  select v.stock_on_hand into v_stock
  from public.product_variants v
  join public.products p on p.id = v.product_id
  join public.categories c on c.id = p.category_id
  where v.id = p_variant_id
    and v.active and p.active and c.active;

  if not found or v_stock < 1 then
    raise exception 'Esta variação está indisponível.' using errcode = '23514';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select id into v_cart_id from public.carts where user_id = v_user_id;

  insert into public.cart_items as existing (cart_id, variant_id, quantity)
  values (v_cart_id, p_variant_id, p_quantity)
  on conflict (cart_id, variant_id) do update
    set quantity = existing.quantity + excluded.quantity,
        updated_at = now()
  returning quantity into v_quantity;

  update public.carts set updated_at = now() where id = v_cart_id;
  return v_quantity;
end;
$$;

create function public.set_cart_item_quantity(p_variant_id uuid, p_quantity integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_quantity integer;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if p_quantity is null or p_quantity < 1 then
    raise exception 'A quantidade deve ser um inteiro positivo.' using errcode = '23514';
  end if;

  select c.id into v_cart_id
  from public.carts c
  join public.cart_items i on i.cart_id = c.id
  where c.user_id = v_user_id and i.variant_id = p_variant_id;

  if not found then
    raise exception 'Item não encontrado no carrinho.' using errcode = 'P0002';
  end if;

  update public.cart_items
  set quantity = p_quantity, updated_at = now()
  where cart_id = v_cart_id and variant_id = p_variant_id
  returning quantity into v_quantity;

  update public.carts set updated_at = now() where id = v_cart_id;
  return v_quantity;
end;
$$;

create function public.remove_cart_item(p_variant_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;

  select id into v_cart_id from public.carts where user_id = v_user_id;
  if v_cart_id is null then return; end if;

  delete from public.cart_items
  where cart_id = v_cart_id and variant_id = p_variant_id;
  update public.carts set updated_at = now() where id = v_cart_id;
end;
$$;

create function public.calculate_shipping_cents(p_address_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_postal_code text;
  v_state text;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;

  select a.postal_code, a.state into v_postal_code, v_state
  from public.addresses a
  where a.id = p_address_id and a.user_id = v_user_id;

  if not found then
    raise exception 'Endereço não encontrado.' using errcode = 'P0002';
  end if;
  if v_postal_code !~ '^[0-9]{8}$' then
    raise exception 'CEP inválido.' using errcode = '22023';
  end if;

  return case v_state
    when 'SP' then 1500
    when 'RJ' then 1500
    when 'ES' then 1500
    when 'MG' then 1500
    when 'PR' then 2000
    when 'RS' then 2000
    when 'SC' then 2000
    when 'DF' then 2500
    when 'GO' then 2500
    when 'MT' then 2500
    when 'MS' then 2500
    when 'AL' then 3000
    when 'BA' then 3000
    when 'CE' then 3000
    when 'MA' then 3000
    when 'PB' then 3000
    when 'PE' then 3000
    when 'PI' then 3000
    when 'RN' then 3000
    when 'SE' then 3000
    when 'AC' then 4000
    when 'AP' then 4000
    when 'AM' then 4000
    when 'PA' then 4000
    when 'RO' then 4000
    when 'RR' then 4000
    when 'TO' then 4000
    else null
  end;
end;
$$;

revoke all on function public.ensure_cart() from public, anon, authenticated;
revoke all on function public.add_cart_item(uuid, integer) from public, anon, authenticated;
revoke all on function public.set_cart_item_quantity(uuid, integer) from public, anon, authenticated;
revoke all on function public.remove_cart_item(uuid) from public, anon, authenticated;
revoke all on function public.calculate_shipping_cents(uuid) from public, anon, authenticated;

grant execute on function public.ensure_cart() to authenticated;
grant execute on function public.add_cart_item(uuid, integer) to authenticated;
grant execute on function public.set_cart_item_quantity(uuid, integer) to authenticated;
grant execute on function public.remove_cart_item(uuid) to authenticated;
grant execute on function public.calculate_shipping_cents(uuid) to authenticated;
