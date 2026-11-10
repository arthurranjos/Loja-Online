do $validation$
declare
  v_user_id uuid;
  v_variant_id uuid;
  v_stock integer;
  v_order_one constant uuid := 'a7000000-0000-4000-8000-000000000071';
  v_order_two constant uuid := 'a7000000-0000-4000-8000-000000000072';
begin
  select u.id into v_user_id
  from auth.users u
  where u.email_confirmed_at is not null
  order by u.created_at desc
  limit 1;
  if v_user_id is null then
    raise exception 'Crie/confirme uma conta local antes da validação.';
  end if;

  select v.id, v.stock_on_hand into v_variant_id, v_stock
  from public.product_variants v
  where v.sku = 'CAM-ESS-G-PR' and v.active;
  if v_variant_id is null or v_stock <> 1 then
    raise exception 'A validação espera a variação de demonstração CAM-ESS-G-PR com estoque 1.';
  end if;

  delete from public.inventory_reservations where order_id in (v_order_one, v_order_two);
  delete from public.order_items where order_id in (v_order_one, v_order_two);
  delete from public.orders where id in (v_order_one, v_order_two);

  insert into public.orders (id, user_id, status)
  values (v_order_one, v_user_id, 'pedido_realizado'), (v_order_two, v_user_id, 'pedido_realizado');
  insert into public.order_items (order_id, variant_id, quantity)
  values (v_order_one, v_variant_id, 1), (v_order_two, v_variant_id, 1);
  raise notice 'Fixtures locais prontos para disputar a variação CAM-ESS-G-PR.';
end;
$validation$;
