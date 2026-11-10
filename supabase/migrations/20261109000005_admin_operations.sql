create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 1 and 100),
  entity_type text not null check (char_length(entity_type) between 1 and 60),
  entity_id uuid not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index audit_events_entity_created_idx on public.audit_events (entity_type, entity_id, created_at desc);
create index audit_events_actor_created_idx on public.audit_events (actor_user_id, created_at desc);
alter table public.audit_events enable row level security;
revoke all on public.audit_events from anon, authenticated;
grant select on public.audit_events to authenticated;

create policy "Admins can read audit events"
on public.audit_events for select to authenticated
using ((select public.is_admin()));

create function public.audit_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_entity_id uuid;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
  else
    v_row := to_jsonb(new);
  end if;
  v_entity_id := (v_row ->> 'id')::uuid;

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id)
  values (
    auth.uid(),
    'catalog.' || lower(tg_op),
    tg_table_name,
    v_entity_id
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.audit_catalog_change() from public, anon, authenticated;

create trigger categories_audit_changes
after insert or update or delete on public.categories
for each row execute function public.audit_catalog_change();
create trigger products_audit_changes
after insert or update or delete on public.products
for each row execute function public.audit_catalog_change();
create trigger product_variants_audit_changes
after insert or update or delete on public.product_variants
for each row execute function public.audit_catalog_change();
create trigger product_images_audit_changes
after insert or update or delete on public.product_images
for each row execute function public.audit_catalog_change();

create policy "Admins can read all profiles"
on public.profiles for select to authenticated
using ((select public.is_admin()));

create policy "Admins can read all categories"
on public.categories for select to authenticated
using ((select public.is_admin()));
create policy "Admins can manage categories"
on public.categories for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
grant insert, update, delete on public.categories to authenticated;

create policy "Admins can read all products"
on public.products for select to authenticated
using ((select public.is_admin()));
create policy "Admins can manage products"
on public.products for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
grant insert, update, delete on public.products to authenticated;

-- Base variant rows, including SKU and stock counts, are readable only by admins.
drop policy "Public can read active product variants" on public.product_variants;
create policy "Admins can read and manage product variants"
on public.product_variants for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
grant select on public.product_variants to authenticated;
grant insert (product_id, size, color, sku, stock_on_hand, active)
  on public.product_variants to authenticated;
grant update (size, color, sku, active)
  on public.product_variants to authenticated;
grant delete on public.product_variants to authenticated;

create policy "Admins can read all product images"
on public.product_images for select to authenticated
using ((select public.is_admin()));
create policy "Admins can manage product images"
on public.product_images for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
grant insert, update, delete on public.product_images to authenticated;

create policy "Admins can read all orders"
on public.orders for select to authenticated
using ((select public.is_admin()));
create policy "Admins can read all order items"
on public.order_items for select to authenticated
using ((select public.is_admin()));
create policy "Admins can read all simulated payments"
on public.simulated_payments for select to authenticated
using ((select public.is_admin()));
create policy "Admins can read all order status history"
on public.order_status_history for select to authenticated
using ((select public.is_admin()));

create function public.admin_set_variant_stock(p_variant_id uuid, p_stock_on_hand integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reserved bigint;
  v_stock integer;
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;
  if p_stock_on_hand is null or p_stock_on_hand < 0 then
    raise exception 'O estoque deve ser um inteiro não negativo.' using errcode = '23514';
  end if;

  select v.stock_on_hand into v_stock
  from public.product_variants v
  where v.id = p_variant_id
  for update;
  if not found then
    raise exception 'Variação não encontrada.' using errcode = 'P0002';
  end if;

  select coalesce(sum(r.quantity), 0) into v_reserved
  from public.inventory_reservations r
  where r.variant_id = p_variant_id
    and r.status = 'active'
    and r.expires_at > clock_timestamp();
  if p_stock_on_hand::bigint < v_reserved then
    raise exception 'O estoque não pode ficar abaixo das unidades retidas em pedidos.' using errcode = '23514';
  end if;

  update public.product_variants
  set stock_on_hand = p_stock_on_hand
  where id = p_variant_id
  returning stock_on_hand into v_stock;
  return v_stock;
end;
$$;

create function public.admin_list_customers()
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;

  return query
  select u.id, u.email::text, p.full_name, p.role, u.created_at
  from auth.users u
  join public.profiles p on p.id = u.id
  order by u.created_at desc;
end;
$$;

create function public.admin_transition_order(p_order_id uuid, p_new_status text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_previous_status text;
  v_reason text;
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;

  select o.status into v_previous_status
  from public.orders o
  where o.id = p_order_id
  for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;

  v_reason := case
    when v_previous_status = 'pagamento_aprovado' and p_new_status = 'em_preparacao' then 'Pedido encaminhado para preparação.'
    when v_previous_status = 'em_preparacao' and p_new_status = 'enviado' then 'Pedido marcado como enviado.'
    when v_previous_status = 'enviado' and p_new_status = 'entregue' then 'Entrega confirmada pelo administrador.'
    else null
  end;
  if v_reason is null then
    raise exception 'Transição de pedido inválida.' using errcode = '23514';
  end if;

  update public.orders set status = p_new_status where id = p_order_id;
  insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id, reason)
  values (p_order_id, v_previous_status, p_new_status, v_actor, v_reason);
  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    v_actor, 'order.status_transition', 'orders', p_order_id,
    jsonb_build_object('previous_status', v_previous_status, 'new_status', p_new_status)
  );

  return p_new_status;
end;
$$;

create function public.bootstrap_initial_admin(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated_id uuid;
begin
  -- Serialize first-admin provisioning so two setup calls cannot promote two accounts.
  perform pg_advisory_xact_lock(20261109, 10);
  if exists (select 1 from public.profiles p where p.role = 'admin') then
    raise exception 'Já existe uma conta administrativa inicial.' using errcode = '23505';
  end if;
  if not exists (
    select 1 from auth.users u
    where u.id = p_user_id and u.email_confirmed_at is not null
  ) then
    raise exception 'A conta deve existir e ter e-mail confirmado.' using errcode = '23514';
  end if;

  update public.profiles p
  set role = 'admin'
  where p.id = p_user_id and p.role = 'customer'
  returning p.id into v_updated_id;
  if v_updated_id is null then
    raise exception 'Não foi possível provisionar a conta administrativa.' using errcode = '23514';
  end if;

  insert into public.audit_events (action, entity_type, entity_id, metadata)
  values (
    'admin.bootstrap_initial', 'profiles', p_user_id,
    jsonb_build_object('operation', 'one_time_local_bootstrap')
  );
  return v_updated_id;
end;
$$;

revoke all on function public.admin_set_variant_stock(uuid, integer) from public, anon, authenticated;
revoke all on function public.admin_list_customers() from public, anon, authenticated;
revoke all on function public.admin_transition_order(uuid, text) from public, anon, authenticated;
revoke all on function public.bootstrap_initial_admin(uuid) from public, anon, authenticated;
grant execute on function public.admin_set_variant_stock(uuid, integer) to authenticated;
grant execute on function public.admin_list_customers() to authenticated;
grant execute on function public.admin_transition_order(uuid, text) to authenticated;
