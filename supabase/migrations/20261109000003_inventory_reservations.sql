-- Minimal order identity and item rows anchor TASK-007 reservations.
-- TASK-008 adds authoritative price snapshots, totals, checkout and payment.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  status text not null default 'pedido_realizado' check (status in (
    'pedido_realizado', 'pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue',
    'pagamento_recusado', 'pedido_cancelado'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (order_id, variant_id)
);

create index order_items_variant_id_idx on public.order_items (variant_id);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'consumed', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, variant_id)
);

create index inventory_reservations_active_variant_expiry_idx
  on public.inventory_reservations (variant_id, expires_at)
  where status = 'active';
create index inventory_reservations_order_status_idx
  on public.inventory_reservations (order_id, status);

create trigger inventory_reservations_set_updated_at
before update on public.inventory_reservations
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_reservations enable row level security;

revoke all on public.orders, public.order_items, public.inventory_reservations from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

create policy "Customers can read their own orders"
on public.orders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Customers can read their own order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = (select auth.uid())
  )
);

create function public.reserve_order_inventory(p_order_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_user_id uuid;
  v_order_status text;
  v_expiry timestamptz;
  v_now timestamptz;
  v_existing_expiry timestamptz;
  v_item record;
  v_stock integer;
  v_reserved bigint;
  v_existing_count integer;
  v_valid_count integer;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;

  select o.user_id, o.status into v_order_user_id, v_order_status
  from public.orders o
  where o.id = p_order_id
  for update;
  if not found or v_order_user_id <> v_user_id then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;
  if v_order_status <> 'pedido_realizado' then
    raise exception 'O pedido não aceita retenção de estoque.' using errcode = '23514';
  end if;
  if not exists (
    select 1 from auth.users u where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'Confirme seu e-mail antes de comprar.' using errcode = '28000';
  end if;

  if not exists (select 1 from public.order_items i where i.order_id = p_order_id) then
    raise exception 'O pedido não possui itens.' using errcode = '23514';
  end if;

  select count(*)::integer,
         (count(*) filter (where r.status = 'active' and r.expires_at > clock_timestamp()))::integer,
         max(r.expires_at)
  into v_existing_count, v_valid_count, v_existing_expiry
  from public.inventory_reservations r
  where r.order_id = p_order_id;

  if v_existing_count > 0 then
    if v_existing_count = v_valid_count then
      return v_existing_expiry;
    end if;
    update public.inventory_reservations
    set status = 'expired'
    where order_id = p_order_id and status = 'active' and expires_at <= clock_timestamp();
    return null;
  end if;

  -- Lock each variant in a stable order; competing checkouts serialize on the same row.
  perform v.id
  from public.product_variants v
  join public.order_items i on i.variant_id = v.id
  where i.order_id = p_order_id
  order by v.id
  for update of v;

  v_now := clock_timestamp();
  v_expiry := v_now + interval '15 minutes';

  -- Expired holds no longer count as unavailable. Mark this order's affected stale holds.
  update public.inventory_reservations r
  set status = 'expired'
  where r.status = 'active'
    and r.expires_at <= v_now
    and r.variant_id in (select i.variant_id from public.order_items i where i.order_id = p_order_id);

  for v_item in
    select i.variant_id, i.quantity
    from public.order_items i
    where i.order_id = p_order_id
    order by i.variant_id
  loop
    select v.stock_on_hand into v_stock
    from public.product_variants v
    join public.products p on p.id = v.product_id and p.active
    join public.categories c on c.id = p.category_id and c.active
    where v.id = v_item.variant_id and v.active;
    if not found then
      raise exception 'Uma variação do pedido não está disponível.' using errcode = '23514';
    end if;

    select coalesce(sum(r.quantity), 0) into v_reserved
    from public.inventory_reservations r
    where r.variant_id = v_item.variant_id
      and r.status = 'active'
      and r.expires_at > v_now;

    if v_stock::bigint < v_item.quantity::bigint + v_reserved then
      raise exception 'Estoque insuficiente para uma das variações.' using errcode = '23514';
    end if;
  end loop;

  insert into public.inventory_reservations (order_id, variant_id, quantity, expires_at)
  select i.order_id, i.variant_id, i.quantity, v_expiry
  from public.order_items i
  where i.order_id = p_order_id;

  return v_expiry;
end;
$$;

create function public.release_order_inventory(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released integer;
  v_now timestamptz;
begin
  perform 1 from public.orders o
  where o.id = p_order_id
  for update;
  if not found then return 0; end if;

  perform v.id
  from public.product_variants v
  join public.inventory_reservations r on r.variant_id = v.id
  where r.order_id = p_order_id
  order by v.id
  for update of v;

  v_now := clock_timestamp();

  update public.inventory_reservations
  set status = 'released'
  where order_id = p_order_id and status = 'active' and expires_at > v_now;
  get diagnostics v_released = row_count;
  return v_released;
end;
$$;

revoke all on function public.reserve_order_inventory(uuid) from public, anon, authenticated;
revoke all on function public.release_order_inventory(uuid) from public, anon, authenticated;
grant execute on function public.reserve_order_inventory(uuid) to authenticated;
