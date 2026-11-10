do $validation$
declare
  v_user_id uuid;
  v_expiry timestamptz;
  v_released integer;
  v_count integer;
  v_status text;
  v_stock integer;
begin
  select o.user_id into v_user_id
  from public.orders o
  where o.id = 'a7000000-0000-4000-8000-000000000071';
  if v_user_id is null then raise exception 'Fixtures de concorrência não encontrados.'; end if;
  perform set_config('request.jwt.claim.sub', v_user_id::text, true);

  -- Repeating reserve for a valid order returns its existing hold, without duplicating it.
  v_expiry := public.reserve_order_inventory('a7000000-0000-4000-8000-000000000071');
  if v_expiry is null then raise exception 'A retenção ativa não foi idempotente.'; end if;
  select count(*) into v_count from public.inventory_reservations
  where order_id = 'a7000000-0000-4000-8000-000000000071';
  if v_count <> 1 then raise exception 'A repetição duplicou a retenção.'; end if;

  v_released := public.release_order_inventory('a7000000-0000-4000-8000-000000000071');
  if v_released <> 1 then raise exception 'A liberação não mudou uma retenção ativa.'; end if;
  if public.release_order_inventory('a7000000-0000-4000-8000-000000000071') <> 0 then
    raise exception 'A liberação repetida não foi idempotente.';
  end if;

  -- Once released, the second order may retain the same unit. Simulate its 15-minute expiry.
  v_expiry := public.reserve_order_inventory('a7000000-0000-4000-8000-000000000072');
  if v_expiry is null or v_expiry <= clock_timestamp() then
    raise exception 'A unidade não foi liberada para o segundo pedido.';
  end if;
  update public.inventory_reservations
  set expires_at = clock_timestamp() - interval '1 second'
  where order_id = 'a7000000-0000-4000-8000-000000000072' and status = 'active';
  v_expiry := public.reserve_order_inventory('a7000000-0000-4000-8000-000000000072');
  if v_expiry is not null then raise exception 'A retenção expirada continuou válida.'; end if;
  select r.status into v_status from public.inventory_reservations r
  where r.order_id = 'a7000000-0000-4000-8000-000000000072';
  if v_status <> 'expired' then raise exception 'O estado vencido não foi registrado.'; end if;

  select v.stock_on_hand into v_stock
  from public.product_variants v where v.sku = 'CAM-ESS-G-PR';
  if v_stock <> 1 then raise exception 'A retenção/liberação alterou o estoque físico.'; end if;
  raise notice 'PASS: idempotência, liberação, expiração e saldo físico conferidos.';
end;
$validation$;
