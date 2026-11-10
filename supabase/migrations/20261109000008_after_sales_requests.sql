create table public.after_sales_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  request_type text not null check (request_type in ('cancellation', 'regret', 'exchange')),
  reason text check (reason is null or char_length(btrim(reason)) <= 1000),
  status text not null default 'submitted' check (status in ('submitted', 'processing', 'approved', 'rejected', 'completed')),
  admin_note text check (admin_note is null or char_length(btrim(admin_note)) <= 1500),
  processed_by uuid references auth.users (id) on delete set null,
  processed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.after_sales_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.after_sales_requests (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  replacement_variant_id uuid references public.product_variants (id) on delete restrict,
  unique (request_id, order_item_id)
);

create unique index after_sales_one_active_cancellation_per_order_idx
  on public.after_sales_requests (order_id)
  where request_type = 'cancellation' and status <> 'rejected';
create index after_sales_user_created_idx on public.after_sales_requests (user_id, created_at desc);
create index after_sales_status_created_idx on public.after_sales_requests (status, created_at);
create index after_sales_request_items_order_item_idx on public.after_sales_request_items (order_item_id);
create trigger after_sales_set_updated_at before update on public.after_sales_requests
for each row execute function public.set_updated_at();

create function public.audit_after_sales_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text;
  v_request public.after_sales_requests%rowtype;
begin
  if tg_op = 'DELETE' then v_request := old; else v_request := new; end if;
  v_action := case when tg_op = 'INSERT' then 'after_sales.submitted' else 'after_sales.' || lower(tg_op) end;
  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(), v_action, 'after_sales_requests', v_request.id,
    jsonb_build_object('request_type', v_request.request_type, 'status', v_request.status, 'order_id', v_request.order_id)
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.audit_after_sales_change() from public, anon, authenticated;
create trigger after_sales_audit_changes after insert or update or delete on public.after_sales_requests
for each row execute function public.audit_after_sales_change();

alter table public.after_sales_requests enable row level security;
alter table public.after_sales_request_items enable row level security;
revoke all on public.after_sales_requests, public.after_sales_request_items from anon, authenticated;
grant select on public.after_sales_requests, public.after_sales_request_items to authenticated;
create policy "Customers can read their own after-sales requests"
on public.after_sales_requests for select to authenticated
using (user_id = (select auth.uid()));
create policy "Admins can read all after-sales requests"
on public.after_sales_requests for select to authenticated
using ((select public.is_admin()));
create policy "Customers can read their own after-sales request items"
on public.after_sales_request_items for select to authenticated
using (exists (
  select 1 from public.after_sales_requests r
  where r.id = request_id and r.user_id = (select auth.uid())
));
create policy "Admins can read all after-sales request items"
on public.after_sales_request_items for select to authenticated
using ((select public.is_admin()));

create function public.submit_after_sales_request(
  p_order_id uuid,
  p_request_type text,
  p_reason text default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_status text;
  v_delivered_at timestamptz;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_request_id uuid;
  v_line jsonb;
  v_order_item_id uuid;
  v_quantity integer;
  v_variant_id uuid;
  v_product_id uuid;
  v_original_quantity integer;
  v_previously_requested bigint;
  v_replacement_product_id uuid;
  v_replacement_active boolean;
  v_stock integer;
  v_reserved bigint;
  v_existing_cancellation boolean;
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if p_request_type is null or p_request_type not in ('cancellation', 'regret', 'exchange') then
    raise exception 'Tipo de solicitação inválido.' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Informe os itens e quantidades da solicitação.' using errcode = '22023';
  end if;
  if p_request_type <> 'regret' and (v_reason is null or char_length(v_reason) < 5) then
    raise exception 'Descreva o motivo em pelo menos 5 caracteres.' using errcode = '23514';
  end if;
  if p_request_type = 'cancellation' and jsonb_array_length(p_items) > 0 then
    raise exception 'Cancelamento pré-envio abrange o pedido inteiro e não recebe linhas parciais.' using errcode = '23514';
  end if;
  if p_request_type in ('regret', 'exchange') and jsonb_array_length(p_items) = 0 then
    raise exception 'Selecione pelo menos um produto e uma quantidade.' using errcode = '23514';
  end if;

  select o.status into v_order_status
  from public.orders o
  where o.id = p_order_id and o.user_id = v_user_id
  for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;

  select exists (
    select 1 from public.after_sales_requests r
    where r.order_id = p_order_id and r.request_type = 'cancellation' and r.status <> 'rejected'
  ) into v_existing_cancellation;

  if p_request_type = 'cancellation' then
    if v_order_status not in ('pedido_realizado', 'pagamento_aprovado', 'em_preparacao') then
      raise exception 'Cancelamento só pode ser solicitado antes do envio.' using errcode = '23514';
    end if;
    if v_existing_cancellation or exists (
      select 1 from public.after_sales_requests r where r.order_id = p_order_id and r.status <> 'rejected'
    ) then
      raise exception 'Este pedido já possui uma solicitação pós-venda ativa.' using errcode = '23505';
    end if;
  else
    if v_existing_cancellation then
      raise exception 'Este pedido possui um cancelamento em análise.' using errcode = '23505';
    end if;
    select max(h.created_at) into v_delivered_at
    from public.order_status_history h
    where h.order_id = p_order_id and h.new_status = 'entregue';
    if v_order_status <> 'entregue' or v_delivered_at is null then
      raise exception 'A solicitação fica disponível após a entrega do pedido.' using errcode = '23514';
    end if;
    if p_request_type = 'regret' and clock_timestamp() > v_delivered_at + interval '7 days' then
      raise exception 'O prazo de arrependimento de 7 dias corridos foi encerrado.' using errcode = '23514';
    end if;
    if p_request_type = 'exchange' and clock_timestamp() > v_delivered_at + interval '30 days' then
      raise exception 'O prazo de troca voluntária de 30 dias foi encerrado.' using errcode = '23514';
    end if;
  end if;

  insert into public.after_sales_requests (order_id, user_id, request_type, reason)
  values (p_order_id, v_user_id, p_request_type, v_reason)
  returning id into v_request_id;

  for v_line in select value from jsonb_array_elements(p_items)
  loop
    if not (v_line ? 'order_item_id') or not (v_line ? 'quantity') then
      raise exception 'Cada linha deve informar o item do pedido e a quantidade.' using errcode = '22023';
    end if;
    v_order_item_id := (v_line ->> 'order_item_id')::uuid;
    v_quantity := (v_line ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'A quantidade solicitada deve ser positiva.' using errcode = '23514';
    end if;
    select oi.quantity, oi.variant_id, v.product_id
    into v_original_quantity, v_variant_id, v_product_id
    from public.order_items oi
    join public.product_variants v on v.id = oi.variant_id
    where oi.id = v_order_item_id and oi.order_id = p_order_id
    for update of oi;
    if not found then
      raise exception 'Um item selecionado não pertence a este pedido.' using errcode = '42501';
    end if;
    select coalesce(sum(asi.quantity), 0) into v_previously_requested
    from public.after_sales_request_items asi
    join public.after_sales_requests ar on ar.id = asi.request_id
    where asi.order_item_id = v_order_item_id and ar.status <> 'rejected';
    if v_previously_requested + v_quantity > v_original_quantity then
      raise exception 'A quantidade selecionada já foi solicitada em outra devolução/troca.' using errcode = '23514';
    end if;

    if p_request_type = 'exchange' then
      if not (v_line ? 'replacement_variant_id') or nullif(v_line ->> 'replacement_variant_id', '') is null then
        raise exception 'Selecione o tamanho e a cor desejados para a troca.' using errcode = '23514';
      end if;
      v_variant_id := (v_line ->> 'replacement_variant_id')::uuid;
      select v.product_id, v.active, v.stock_on_hand into v_replacement_product_id, v_replacement_active, v_stock
      from public.product_variants v where v.id = v_variant_id for update;
      if not found or not v_replacement_active or v_replacement_product_id <> v_product_id then
        raise exception 'A variação escolhida para a troca não está disponível para este produto.' using errcode = '23514';
      end if;
      select coalesce(sum(ir.quantity), 0) into v_reserved
      from public.inventory_reservations ir
      where ir.variant_id = v_variant_id and ir.status = 'active' and ir.expires_at > clock_timestamp();
      if v_variant_id = (select oi.variant_id from public.order_items oi where oi.id = v_order_item_id) then
        raise exception 'Escolha um tamanho ou cor diferente para a troca.' using errcode = '23514';
      end if;
      if v_stock::bigint - v_reserved < v_quantity then
        raise exception 'A variação escolhida não tem estoque disponível suficiente.' using errcode = '23514';
      end if;
      insert into public.after_sales_request_items (request_id, order_item_id, quantity, replacement_variant_id)
      values (v_request_id, v_order_item_id, v_quantity, v_variant_id);
    elsif p_request_type = 'regret' then
      if v_line ? 'replacement_variant_id' and nullif(v_line ->> 'replacement_variant_id', '') is not null then
        raise exception 'Variação de reposição só é permitida em uma troca.' using errcode = '22023';
      end if;
      insert into public.after_sales_request_items (request_id, order_item_id, quantity)
      values (v_request_id, v_order_item_id, v_quantity);
    end if;
  end loop;
  return v_request_id;
exception
  when unique_violation then
    raise exception 'Este pedido ou item já possui uma solicitação conflitante.' using errcode = '23505';
end;
$$;

create function public.admin_process_after_sales_request(p_request_id uuid, p_action text, p_admin_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_request public.after_sales_requests%rowtype;
  v_order_status text;
  v_next_status text;
  v_admin_note text := nullif(btrim(coalesce(p_admin_note, '')), '');
  v_item record;
  v_available bigint;
  v_all_returned boolean;
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;
  if p_action is null or p_action not in ('processing', 'approve', 'reject', 'complete') then
    raise exception 'Ação pós-venda inválida.' using errcode = '22023';
  end if;
  if v_admin_note is not null and char_length(v_admin_note) > 1500 then
    raise exception 'A observação administrativa é muito longa.' using errcode = '23514';
  end if;

  select r.* into v_request from public.after_sales_requests r where r.id = p_request_id for update;
  if not found then
    raise exception 'Solicitação não encontrada.' using errcode = 'P0002';
  end if;
  select o.status into v_order_status from public.orders o where o.id = v_request.order_id for update;
  if not found then
    raise exception 'Pedido não encontrado.' using errcode = 'P0002';
  end if;

  if p_action = 'processing' and v_request.request_type in ('regret', 'exchange') and v_request.status = 'submitted' then
    v_next_status := 'processing';
  elsif p_action = 'approve' and v_request.request_type = 'cancellation'
        and v_request.status in ('submitted', 'processing') then
    if v_order_status not in ('pedido_realizado', 'pagamento_aprovado', 'em_preparacao') then
      raise exception 'O pedido já foi enviado; use a solicitação de devolução.' using errcode = '23514';
    end if;
    if v_order_status = 'pedido_realizado' then
      perform public.release_order_inventory(v_request.order_id);
    else
      perform v.id from public.product_variants v
      join public.order_items oi on oi.variant_id = v.id
      where oi.order_id = v_request.order_id order by v.id for update of v;
      update public.product_variants v
      set stock_on_hand = v.stock_on_hand + source.quantity
      from (select oi.variant_id, sum(oi.quantity)::integer as quantity from public.order_items oi
            where oi.order_id = v_request.order_id group by oi.variant_id) source
      where v.id = source.variant_id;
    end if;
    update public.orders set status = 'pedido_cancelado', cancelled_at = clock_timestamp()
    where id = v_request.order_id;
    insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id, reason)
    values (v_request.order_id, v_order_status, 'pedido_cancelado', v_actor, 'Cancelamento aprovado antes do envio; estoque liberado conforme política da loja.');
    v_next_status := 'completed';
  elsif p_action = 'approve' and v_request.request_type = 'exchange'
        and v_request.status in ('submitted', 'processing') then
    if v_order_status <> 'entregue' then
      raise exception 'A troca só pode ser aprovada para pedido entregue.' using errcode = '23514';
    end if;
    for v_item in
      select asi.replacement_variant_id, sum(asi.quantity)::bigint as quantity
      from public.after_sales_request_items asi where asi.request_id = p_request_id
      group by asi.replacement_variant_id order by asi.replacement_variant_id
    loop
      perform 1 from public.product_variants v where v.id = v_item.replacement_variant_id for update;
      select v.stock_on_hand::bigint - coalesce((
        select sum(ir.quantity) from public.inventory_reservations ir
        where ir.variant_id = v.id and ir.status = 'active' and ir.expires_at > clock_timestamp()
      ), 0) into v_available
      from public.product_variants v where v.id = v_item.replacement_variant_id and v.active;
      if v_available is null or v_available < v_item.quantity then
        raise exception 'A variação de reposição não tem mais estoque suficiente; solicitação não aprovada.' using errcode = '23514';
      end if;
    end loop;
    v_next_status := 'approved';
  elsif p_action = 'reject' and v_request.request_type in ('cancellation', 'exchange')
        and v_request.status in ('submitted', 'processing', 'approved') then
    if v_admin_note is null or char_length(v_admin_note) < 5 then
      raise exception 'Informe o motivo da recusa.' using errcode = '23514';
    end if;
    v_next_status := 'rejected';
  elsif p_action = 'complete' and v_request.status in ('processing', 'approved')
        and v_request.request_type in ('regret', 'exchange') then
    if v_request.request_type = 'regret' and v_request.status <> 'processing' then
      raise exception 'O arrependimento legal não exige aprovação discricionária; conclua após receber e conferir a devolução.' using errcode = '23514';
    end if;
    if v_request.request_type = 'exchange' and (v_request.status <> 'approved' or v_order_status <> 'entregue') then
      raise exception 'A troca precisa estar aprovada e o pedido entregue.' using errcode = '23514';
    end if;
    if v_request.request_type = 'regret' and v_order_status <> 'entregue' then
      raise exception 'O pedido não está entregue para concluir a devolução.' using errcode = '23514';
    end if;
    if v_admin_note is null or char_length(v_admin_note) < 5 then
      raise exception 'Registre o recebimento e a conferência do item devolvido.' using errcode = '23514';
    end if;

    perform v.id from public.product_variants v
    where v.id in (
      select oi.variant_id from public.after_sales_request_items asi
      join public.order_items oi on oi.id = asi.order_item_id where asi.request_id = p_request_id
      union
      select asi.replacement_variant_id from public.after_sales_request_items asi
      where asi.request_id = p_request_id and asi.replacement_variant_id is not null
    ) order by v.id for update;

    for v_item in
      select asi.order_item_id, asi.quantity, oi.variant_id as original_variant_id,
             asi.replacement_variant_id
      from public.after_sales_request_items asi
      join public.order_items oi on oi.id = asi.order_item_id
      where asi.request_id = p_request_id order by asi.order_item_id
    loop
      if v_request.request_type = 'exchange' then
        select v.stock_on_hand::bigint - coalesce((
          select sum(ir.quantity) from public.inventory_reservations ir
          where ir.variant_id = v.id and ir.status = 'active' and ir.expires_at > clock_timestamp()
        ), 0) into v_available
        from public.product_variants v where v.id = v_item.replacement_variant_id and v.active;
        if v_available is null or v_available < v_item.quantity then
          raise exception 'Estoque da variação de reposição mudou; a troca permanece aprovada até haver saldo.' using errcode = '23514';
        end if;
        update public.product_variants set stock_on_hand = stock_on_hand - v_item.quantity
        where id = v_item.replacement_variant_id;
      end if;
      update public.product_variants set stock_on_hand = stock_on_hand + v_item.quantity
      where id = v_item.original_variant_id;
    end loop;
    v_next_status := 'completed';
  else
    raise exception 'A ação não é permitida para o estado e tipo desta solicitação.' using errcode = '23514';
  end if;

  update public.after_sales_requests r
  set status = v_next_status,
      admin_note = coalesce(v_admin_note, r.admin_note),
      processed_by = v_actor,
      processed_at = coalesce(r.processed_at, clock_timestamp()),
      completed_at = case when v_next_status = 'completed' then clock_timestamp() else r.completed_at end
  where r.id = p_request_id;

  if v_next_status = 'completed' and v_request.request_type = 'regret' then
    select not exists (
      select 1 from public.order_items oi
      where oi.order_id = v_request.order_id
        and oi.quantity > coalesce((
          select sum(asi.quantity)::integer
          from public.after_sales_request_items asi
          join public.after_sales_requests ar on ar.id = asi.request_id
          where asi.order_item_id = oi.id and ar.request_type = 'regret' and ar.status = 'completed'
        ), 0)
    ) into v_all_returned;
    if v_all_returned then
      update public.orders set status = 'pedido_cancelado', cancelled_at = clock_timestamp()
      where id = v_request.order_id;
      insert into public.order_status_history (order_id, previous_status, new_status, actor_user_id, reason)
      values (v_request.order_id, v_order_status, 'pedido_cancelado', v_actor, 'Todos os itens foram devolvidos após recebimento e conferência; pagamento era simulado.');
    end if;
  end if;

  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (v_actor, 'after_sales.process', 'after_sales_requests', p_request_id,
          jsonb_build_object('request_type', v_request.request_type, 'status', v_next_status, 'action', p_action));
  return v_next_status;
end;
$$;

revoke all on function public.submit_after_sales_request(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_process_after_sales_request(uuid, text, text) from public, anon, authenticated;
grant execute on function public.submit_after_sales_request(uuid, text, text, jsonb) to authenticated;
grant execute on function public.admin_process_after_sales_request(uuid, text, text) to authenticated;
