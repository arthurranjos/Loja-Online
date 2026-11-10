do $validation$
declare
  v_user_id uuid;
  v_variant_id uuid;
  v_stock integer;
  v_expiry timestamptz;
  v_outcome text;
  v_reason text;
  v_status text;
  v_total text;
  v_payment_count integer;
  v_test_order constant uuid := 'a8000000-0000-4000-8000-000000000081';
begin
  select u.id into v_user_id
  from auth.users u
  where u.email_confirmed_at is not null
  order by u.created_at desc
  limit 1;
  if v_user_id is null then raise exception 'É necessária uma conta local com e-mail confirmado.'; end if;

  select v.id, v.stock_on_hand into v_variant_id, v_stock
  from public.product_variants v
  where v.sku = 'CAM-ESS-G-PR' and v.active;
  if v_variant_id is null or v_stock < 1 then
    raise exception 'A validação de expiração espera estoque positivo em CAM-ESS-G-PR.';
  end if;

  delete from public.simulated_payments where order_id = v_test_order;
  delete from public.order_status_history where order_id = v_test_order;
  delete from public.inventory_reservations where order_id = v_test_order;
  delete from public.order_items where order_id = v_test_order;
  delete from public.orders where id = v_test_order;

  insert into public.orders (id, user_id, status)
  values (v_test_order, v_user_id, 'pedido_realizado');
  insert into public.order_items (order_id, variant_id, quantity)
  values (v_test_order, v_variant_id, 1);
  perform set_config('request.jwt.claim.sub', v_user_id::text, true);

  v_expiry := public.reserve_order_inventory(v_test_order);
  if v_expiry is null or v_expiry <= clock_timestamp() then
    raise exception 'A retenção inicial de 15 minutos não foi criada.';
  end if;

  update public.inventory_reservations
  set expires_at = clock_timestamp() - interval '1 second'
  where order_id = v_test_order and status = 'active';

  select p.result_outcome, p.result_reason, p.result_status, p.result_total_cents
  into v_outcome, v_reason, v_status, v_total
  from public.process_simulated_payment(v_test_order, 'approved') p;
  if v_outcome <> 'declined' or v_status <> 'pagamento_recusado'
     or v_reason not like '%expirou%' then
    raise exception 'A aprovação tardia não foi recusada corretamente.';
  end if;
  if v_total <> '0' then raise exception 'O total do fixture deveria ser zero.'; end if;

  -- A conflicting retry must return the recorded result and never debit stock twice.
  select p.result_outcome into v_outcome
  from public.process_simulated_payment(v_test_order, 'declined') p;
  select count(*)::integer into v_payment_count
  from public.simulated_payments p where p.order_id = v_test_order;
  if v_outcome <> 'declined' or v_payment_count <> 1 then
    raise exception 'A repetição alterou ou duplicou o resultado do pagamento.';
  end if;
  if (select v.stock_on_hand from public.product_variants v where v.id = v_variant_id) <> v_stock then
    raise exception 'A aprovação tardia alterou o estoque físico.';
  end if;

  delete from public.simulated_payments where order_id = v_test_order;
  delete from public.order_status_history where order_id = v_test_order;
  delete from public.inventory_reservations where order_id = v_test_order;
  delete from public.order_items where order_id = v_test_order;
  delete from public.orders where id = v_test_order;
  raise notice 'PASS: aprovação tardia recusada, repetição idempotente e saldo físico inalterado.';
end;
$validation$;
