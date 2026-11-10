alter table public.orders
  add column cart_id uuid references public.carts (id) on delete set null,
  add column shipping_address_id uuid references public.addresses (id) on delete set null,
  add column shipping_address_snapshot jsonb not null default '{}'::jsonb,
  add column subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  add column discount_cents bigint not null default 0 check (discount_cents >= 0),
  add column shipping_cents bigint not null default 0 check (shipping_cents >= 0),
  add column total_cents bigint not null default 0 check (total_cents >= 0),
  add column payment_approved_at timestamptz,
  add column cancelled_at timestamptz,
  add constraint orders_amounts_consistent check (
    discount_cents <= subtotal_cents
    and total_cents = subtotal_cents - discount_cents + shipping_cents
  ),
  add constraint orders_address_snapshot_object check (jsonb_typeof(shipping_address_snapshot) = 'object');

create index orders_cart_status_idx on public.orders (cart_id, status, created_at desc);

alter table public.order_items
  add column product_name text not null default '',
  add column sku text not null default '',
  add column size text not null default '',
  add column color text not null default '',
  add column unit_price_cents bigint not null default 0 check (unit_price_cents >= 0),
  add column discount_cents bigint not null default 0 check (discount_cents >= 0);

create table public.simulated_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  outcome text not null check (outcome in ('approved', 'declined')),
  reason text check (reason is null or char_length(reason) between 1 and 240),
  processed_at timestamptz not null default now(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 1 and 120),
  check ((outcome = 'approved' and reason is null) or outcome = 'declined')
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  previous_status text check (previous_status is null or previous_status in (
    'pedido_realizado', 'pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue',
    'pagamento_recusado', 'pedido_cancelado'
  )),
  new_status text not null check (new_status in (
    'pedido_realizado', 'pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue',
    'pagamento_recusado', 'pedido_cancelado'
  )),
  actor_user_id uuid references auth.users (id) on delete set null,
  reason text check (reason is null or char_length(reason) <= 240),
  created_at timestamptz not null default now()
);

create index order_status_history_order_created_idx on public.order_status_history (order_id, created_at);

alter table public.simulated_payments enable row level security;
alter table public.order_status_history enable row level security;

revoke all on public.simulated_payments, public.order_status_history from anon, authenticated;
grant select on public.simulated_payments, public.order_status_history to authenticated;

create policy "Customers can read their own simulated payments"
on public.simulated_payments for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = (select auth.uid())
  )
);

create policy "Customers can read their own order status history"
on public.order_status_history for select to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = (select auth.uid())
  )
);

create function public.create_order_from_cart(p_address_id uuid)
returns table (
  created_order_id uuid,
  subtotal_cents text,
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
  v_existing_order_id uuid;
  v_expiry timestamptz;
  v_cart_count integer;
  v_valid_count integer;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if not exists (
    select 1 from auth.users u where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'Confirme seu e-mail antes de comprar.' using errcode = '28000';
  end if;

  select c.id into v_cart_id
  from public.carts c
  where c.user_id = v_user_id
  for update;
  if not found then
    raise exception 'O carrinho está vazio.' using errcode = '23514';
  end if;

  select o.id into v_existing_order_id
  from public.orders o
  where o.cart_id = v_cart_id
    and o.user_id = v_user_id
    and o.status = 'pedido_realizado'
    and exists (
      select 1 from public.inventory_reservations r
      where r.order_id = o.id and r.status = 'active' and r.expires_at > clock_timestamp()
    )
  order by o.created_at desc
  limit 1
  for update;

  if found then
    select o.subtotal_cents::text, o.shipping_cents::text, o.total_cents::text,
           max(r.expires_at),
           concat(o.shipping_address_snapshot ->> 'recipient_name', ' · ',
                  o.shipping_address_snapshot ->> 'postal_code', ' · ',
                  o.shipping_address_snapshot ->> 'city', '/',
                  o.shipping_address_snapshot ->> 'state')
    into subtotal_cents, shipping_cents, total_cents, reservation_expires_at, delivery_address
    from public.orders o
    join public.inventory_reservations r on r.order_id = o.id
    where o.id = v_existing_order_id
      and r.status = 'active'
      and r.expires_at > clock_timestamp()
    group by o.id;
    created_order_id := v_existing_order_id;
    return next;
    return;
  end if;

  select jsonb_build_object(
    'recipient_name', a.recipient_name,
    'postal_code', a.postal_code,
    'street', a.street,
    'street_number', a.street_number,
    'complement', a.complement,
    'district', a.district,
    'city', a.city,
    'state', a.state
  ) into v_address
  from public.addresses a
  where a.id = p_address_id and a.user_id = v_user_id
  for share;
  if not found then
    raise exception 'Endereço não encontrado.' using errcode = 'P0002';
  end if;

  select count(*)::integer into v_cart_count
  from public.cart_items i where i.cart_id = v_cart_id;
  if v_cart_count = 0 then
    raise exception 'O carrinho está vazio.' using errcode = '23514';
  end if;

  -- Match TASK-007's stable lock order and include product rows so captured prices are consistent.
  perform v.id
  from public.product_variants v
  join public.products p on p.id = v.product_id
  join public.categories c on c.id = p.category_id
  join public.cart_items i on i.variant_id = v.id
  where i.cart_id = v_cart_id
  order by v.id
  for update of v, p, c;

  select count(*)::integer into v_valid_count
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id and v.active
  join public.products p on p.id = v.product_id and p.active
  join public.categories c on c.id = p.category_id and c.active
  where i.cart_id = v_cart_id;
  if v_valid_count <> v_cart_count then
    raise exception 'Um item do carrinho não está mais disponível.' using errcode = '23514';
  end if;

  select coalesce(sum(p.price_cents * i.quantity::bigint), 0)
  into v_subtotal_cents
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id
  join public.products p on p.id = v.product_id
  where i.cart_id = v_cart_id;

  select public.calculate_shipping_cents(p_address_id) into v_shipping_cents;

  insert into public.orders (
    user_id, cart_id, shipping_address_id, shipping_address_snapshot,
    status, subtotal_cents, discount_cents, shipping_cents, total_cents
  ) values (
    v_user_id, v_cart_id, p_address_id, v_address,
    'pedido_realizado', v_subtotal_cents, 0, v_shipping_cents,
    v_subtotal_cents + v_shipping_cents
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, variant_id, quantity, product_name, sku, size, color,
    unit_price_cents, discount_cents
  )
  select v_order_id, i.variant_id, i.quantity, p.name, v.sku, v.size, v.color,
         p.price_cents, 0
  from public.cart_items i
  join public.product_variants v on v.id = i.variant_id
  join public.products p on p.id = v.product_id
  where i.cart_id = v_cart_id;

  select public.reserve_order_inventory(v_order_id) into v_expiry;
  if v_expiry is null then
    raise exception 'Não foi possível reter o estoque para o pedido.' using errcode = '55000';
  end if;

  insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id)
  values (v_order_id, null, 'pedido_realizado', v_user_id);

  created_order_id := v_order_id;
  subtotal_cents := v_subtotal_cents::text;
  shipping_cents := v_shipping_cents::text;
  total_cents := (v_subtotal_cents + v_shipping_cents)::text;
  reservation_expires_at := v_expiry;
  delivery_address := concat(v_address ->> 'recipient_name', ' · ', v_address ->> 'postal_code', ' · ', v_address ->> 'city', '/', v_address ->> 'state');
  return next;
end;
$$;

create function public.process_simulated_payment(p_order_id uuid, p_decision text)
returns table (
  result_outcome text,
  result_reason text,
  result_status text,
  result_total_cents text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_user_id uuid;
  v_order_status text;
  v_cart_id uuid;
  v_total_cents bigint;
  v_existing_outcome text;
  v_existing_reason text;
  v_result_outcome text;
  v_result_reason text;
  v_result_status text;
  v_now timestamptz;
  v_item record;
  v_item_count integer;
  v_valid_reservation_count integer;
  v_updated integer;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if p_decision is null or p_decision not in ('approved', 'declined') then
    raise exception 'Resultado de pagamento inválido.' using errcode = '22023';
  end if;

  select o.user_id, o.status, o.cart_id, o.total_cents
  into v_order_user_id, v_order_status, v_cart_id, v_total_cents
  from public.orders o
  where o.id = p_order_id
  for update;
  if not found or v_order_user_id <> v_user_id then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;

  select p.outcome, p.reason into v_existing_outcome, v_existing_reason
  from public.simulated_payments p
  where p.order_id = p_order_id;
  if found then
    result_outcome := v_existing_outcome;
    result_reason := v_existing_reason;
    result_status := v_order_status;
    result_total_cents := v_total_cents::text;
    return next;
    return;
  end if;
  if v_order_status <> 'pedido_realizado' then
    raise exception 'O pedido não está aguardando pagamento.' using errcode = '23514';
  end if;
  if not exists (
    select 1 from auth.users u where u.id = v_user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'Confirme seu e-mail antes de pagar.' using errcode = '28000';
  end if;

  perform v.id
  from public.product_variants v
  join public.inventory_reservations r on r.variant_id = v.id
  where r.order_id = p_order_id
  order by v.id
  for update of v;

  v_now := clock_timestamp();
  update public.inventory_reservations r
  set status = 'expired'
  where r.order_id = p_order_id and r.status = 'active' and r.expires_at <= v_now;

  select count(*)::integer into v_item_count
  from public.order_items i where i.order_id = p_order_id;
  select count(*)::integer into v_valid_reservation_count
  from public.inventory_reservations r
  join public.order_items i on i.order_id = r.order_id and i.variant_id = r.variant_id
  where r.order_id = p_order_id and r.status = 'active' and r.expires_at > v_now
    and r.quantity = i.quantity;

  if p_decision = 'approved'
     and (v_item_count = 0 or v_valid_reservation_count <> v_item_count) then
    v_result_outcome := 'declined';
    v_result_reason := 'A reserva de estoque expirou antes da aprovação do pagamento.';
  elsif p_decision = 'declined' then
    v_result_outcome := 'declined';
    v_result_reason := 'Pagamento recusado na simulação pelo cliente.';
  else
    v_result_outcome := 'approved';
    v_result_reason := null;
  end if;

  if v_result_outcome = 'approved' then
    for v_item in
      select i.variant_id, i.quantity
      from public.order_items i
      where i.order_id = p_order_id
      order by i.variant_id
    loop
      update public.product_variants v
      set stock_on_hand = v.stock_on_hand - v_item.quantity
      where v.id = v_item.variant_id and v.stock_on_hand >= v_item.quantity;
      get diagnostics v_updated = row_count;
      if v_updated <> 1 then
        raise exception 'Não foi possível confirmar a baixa de estoque.' using errcode = '23514';
      end if;
    end loop;

    update public.inventory_reservations r
    set status = 'consumed'
    where r.order_id = p_order_id and r.status = 'active' and r.expires_at > v_now;
    update public.orders o
    set status = 'pagamento_aprovado', payment_approved_at = v_now
    where o.id = p_order_id;
    v_result_status := 'pagamento_aprovado';
    insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id)
    values (p_order_id, v_order_status, v_result_status, v_user_id);

    -- Remove only the purchased quantities, preserving any extra units added to the cart meanwhile.
    if v_cart_id is not null then
      delete from public.cart_items ci
      using public.order_items oi
      where ci.cart_id = v_cart_id and oi.order_id = p_order_id
        and ci.variant_id = oi.variant_id and ci.quantity <= oi.quantity;
      update public.cart_items ci
      set quantity = ci.quantity - oi.quantity
      from public.order_items oi
      where ci.cart_id = v_cart_id and oi.order_id = p_order_id
        and ci.variant_id = oi.variant_id and ci.quantity > oi.quantity;
    end if;
  else
    perform public.release_order_inventory(p_order_id);
    update public.orders o
    set status = 'pagamento_recusado'
    where o.id = p_order_id;
    v_result_status := 'pagamento_recusado';
    insert into public.order_status_history (
      order_id, previous_status, new_status, actor_user_id, reason
    ) values (p_order_id, v_order_status, v_result_status, v_user_id, v_result_reason);
  end if;

  insert into public.simulated_payments (order_id, outcome, reason, idempotency_key)
  values (p_order_id, v_result_outcome, v_result_reason, 'simulated-payment:' || p_order_id::text);

  result_outcome := v_result_outcome;
  result_reason := v_result_reason;
  result_status := v_result_status;
  result_total_cents := v_total_cents::text;
  return next;
end;
$$;

revoke all on function public.create_order_from_cart(uuid) from public, anon, authenticated;
revoke all on function public.process_simulated_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.create_order_from_cart(uuid) to authenticated;
grant execute on function public.process_simulated_payment(uuid, text) to authenticated;
