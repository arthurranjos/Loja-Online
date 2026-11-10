create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  percentage numeric(5,2),
  fixed_discount_cents bigint,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (
    (discount_type = 'percentage' and percentage > 0 and percentage <= 100 and fixed_discount_cents is null)
    or (discount_type = 'fixed' and fixed_discount_cents > 0 and percentage is null)
  )
);

create index promotions_product_window_idx on public.promotions (product_id, starts_at, ends_at) where active;
create trigger promotions_set_updated_at before update on public.promotions
for each row execute function public.set_updated_at();
create trigger promotions_audit_changes after insert or update or delete on public.promotions
for each row execute function public.audit_catalog_change();

create function public.lock_promotion_product()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_product_active boolean;
begin
  if tg_op = 'UPDATE' and old.product_id <> new.product_id then
    raise exception 'O produto de uma promoção não pode ser alterado; crie outra promoção.' using errcode = '23514';
  end if;
  select p.active into v_product_active from public.products p where p.id = new.product_id for update;
  if not found then
    raise exception 'Produto da promoção não encontrado.' using errcode = 'P0002';
  end if;
  if not v_product_active then
    raise exception 'Ative o produto antes de criar ou ativar uma promoção.' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.lock_promotion_product() from public, anon, authenticated;
create trigger promotions_lock_product before insert or update on public.promotions
for each row execute function public.lock_promotion_product();

alter table public.promotions enable row level security;
revoke all on public.promotions from anon, authenticated;
grant select, insert, update on public.promotions to authenticated;
create policy "Admins can read promotions"
on public.promotions for select to authenticated
using ((select public.is_admin()));
create policy "Admins can create promotions"
on public.promotions for insert to authenticated
with check ((select public.is_admin()));
create policy "Admins can update promotions"
on public.promotions for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create function public.product_price_breakdown_at(p_product_id uuid, p_at timestamptz)
returns table (
  list_price_cents bigint,
  discount_cents bigint,
  final_price_cents bigint,
  promotion_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  with product as (
    select p.id, p.price_cents
    from public.products p
    join public.categories c on c.id = p.category_id and c.active
    where p.id = p_product_id and p.active
  ), candidates as (
    select pr.id, pr.starts_at,
      least(p.price_cents,
        case pr.discount_type
          when 'percentage' then round(p.price_cents::numeric * pr.percentage / 100)::bigint
          else pr.fixed_discount_cents
        end
      ) as discount_cents
    from product p
    join public.promotions pr on pr.product_id = p.id
    where pr.active and pr.starts_at <= p_at and pr.ends_at > p_at
  ), winner as (
    select c.id, c.discount_cents
    from candidates c
    order by c.discount_cents desc, c.starts_at desc, c.id asc
    limit 1
  )
  select p.price_cents, coalesce(w.discount_cents, 0),
         p.price_cents - coalesce(w.discount_cents, 0), w.id
  from product p left join winner w on true;
$$;
revoke all on function public.product_price_breakdown_at(uuid, timestamptz) from public, anon, authenticated;
create function public.product_price_breakdown(p_product_id uuid)
returns table (
  list_price_cents bigint,
  discount_cents bigint,
  final_price_cents bigint,
  promotion_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.product_price_breakdown_at(p_product_id, statement_timestamp());
$$;
revoke all on function public.product_price_breakdown(uuid) from public, anon, authenticated;
grant execute on function public.product_price_breakdown(uuid) to anon, authenticated;

create view public.catalog_product_prices
with (security_barrier = true)
as
select p.id as product_id, price.list_price_cents, price.discount_cents,
       price.final_price_cents, price.promotion_id
from public.products p
join public.categories c on c.id = p.category_id
cross join lateral public.product_price_breakdown(p.id) as price
where p.active and c.active;
revoke all on public.catalog_product_prices from anon, authenticated;
grant select on public.catalog_product_prices to anon, authenticated;

alter table public.order_items
  add column promotion_id uuid references public.promotions (id) on delete restrict;

drop function public.create_order_from_cart(uuid);
create function public.create_order_from_cart(p_address_id uuid)
returns table (
  created_order_id uuid,
  subtotal_cents text,
  discount_cents text,
  shipping_cents text,
  total_cents text,
  reservation_expires_at timestamptz,
  delivery_address text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
  v_order_id uuid;
  v_address jsonb;
  v_shipping_cents bigint;
  v_subtotal_cents bigint;
  v_discount_cents bigint;
  v_existing_order_id uuid;
  v_expiry timestamptz;
  v_cart_count integer;
  v_valid_count integer;
  v_price_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if not exists (
    select 1 from auth.users u where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'Confirme seu e-mail antes de comprar.' using errcode = '28000';
  end if;

  select c.id into v_cart_id from public.carts c where c.user_id = v_user_id for update;
  if not found then raise exception 'O carrinho está vazio.' using errcode = '23514'; end if;

  select o.id into v_existing_order_id
  from public.orders o
  where o.cart_id = v_cart_id and o.user_id = v_user_id and o.status = 'pedido_realizado'
    and exists (select 1 from public.inventory_reservations r
                where r.order_id = o.id and r.status = 'active' and r.expires_at > clock_timestamp())
  order by o.created_at desc limit 1 for update;
  if found then
    select o.subtotal_cents::text, o.discount_cents::text, o.shipping_cents::text,
           o.total_cents::text, max(r.expires_at),
           concat(o.shipping_address_snapshot ->> 'recipient_name', ' · ',
                  o.shipping_address_snapshot ->> 'postal_code', ' · ',
                  o.shipping_address_snapshot ->> 'city', '/',
                  o.shipping_address_snapshot ->> 'state')
    into subtotal_cents, discount_cents, shipping_cents, total_cents, reservation_expires_at, delivery_address
    from public.orders o join public.inventory_reservations r on r.order_id = o.id
    where o.id = v_existing_order_id and r.status = 'active' and r.expires_at > clock_timestamp()
    group by o.id;
    created_order_id := v_existing_order_id;
    return next; return;
  end if;

  select jsonb_build_object(
    'recipient_name', a.recipient_name, 'postal_code', a.postal_code,
    'street', a.street, 'street_number', a.street_number, 'complement', a.complement,
    'district', a.district, 'city', a.city, 'state', a.state
  ) into v_address
  from public.addresses a where a.id = p_address_id and a.user_id = v_user_id for share;
  if not found then raise exception 'Endereço não encontrado.' using errcode = 'P0002'; end if;

  select count(*)::integer into v_cart_count from public.cart_items i where i.cart_id = v_cart_id;
  if v_cart_count = 0 then raise exception 'O carrinho está vazio.' using errcode = '23514'; end if;

  perform v.id
  from public.product_variants v
  join public.products p on p.id = v.product_id
  join public.categories c on c.id = p.category_id
  join public.cart_items i on i.variant_id = v.id
  where i.cart_id = v_cart_id
  order by v.id for update of v, p, c;

  select count(*)::integer into v_valid_count
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id and v.active
  join public.products p on p.id = v.product_id and p.active
  join public.categories c on c.id = p.category_id and c.active
  where i.cart_id = v_cart_id;
  if v_valid_count <> v_cart_count then
    raise exception 'Um item do carrinho não está mais disponível.' using errcode = '23514';
  end if;

  v_price_at := clock_timestamp();
  select coalesce(sum(p.price_cents * i.quantity::bigint), 0),
         coalesce(sum(price.discount_cents * i.quantity::bigint), 0)
  into v_subtotal_cents, v_discount_cents
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id
  join public.products p on p.id = v.product_id
  cross join lateral public.product_price_breakdown_at(p.id, v_price_at) as price
  where i.cart_id = v_cart_id;

  select public.calculate_shipping_cents(p_address_id) into v_shipping_cents;
  insert into public.orders (
    user_id, cart_id, shipping_address_id, shipping_address_snapshot,
    status, subtotal_cents, discount_cents, shipping_cents, total_cents
  ) values (
    v_user_id, v_cart_id, p_address_id, v_address, 'pedido_realizado',
    v_subtotal_cents, v_discount_cents, v_shipping_cents,
    v_subtotal_cents - v_discount_cents + v_shipping_cents
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, variant_id, quantity, product_name, sku, size, color,
    unit_price_cents, discount_cents, promotion_id
  )
  select v_order_id, i.variant_id, i.quantity, p.name, v.sku, v.size, v.color,
         p.price_cents, price.discount_cents * i.quantity::bigint, price.promotion_id
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id
  join public.products p on p.id = v.product_id
  cross join lateral public.product_price_breakdown_at(p.id, v_price_at) as price
  where i.cart_id = v_cart_id;

  select public.reserve_order_inventory(v_order_id) into v_expiry;
  if v_expiry is null then raise exception 'Não foi possível reter o estoque para o pedido.' using errcode = '55000'; end if;
  insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id)
  values (v_order_id, null, 'pedido_realizado', v_user_id);

  created_order_id := v_order_id;
  subtotal_cents := v_subtotal_cents::text;
  discount_cents := v_discount_cents::text;
  shipping_cents := v_shipping_cents::text;
  total_cents := (v_subtotal_cents - v_discount_cents + v_shipping_cents)::text;
  reservation_expires_at := v_expiry;
  delivery_address := concat(v_address ->> 'recipient_name', ' · ', v_address ->> 'postal_code', ' · ', v_address ->> 'city', '/', v_address ->> 'state');
  return next;
end;
$$;

revoke all on function public.create_order_from_cart(uuid) from public, anon, authenticated;
grant execute on function public.create_order_from_cart(uuid) to authenticated;
