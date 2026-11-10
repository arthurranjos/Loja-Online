\set ON_ERROR_STOP on
begin;
select set_config(
  'request.jwt.claim.sub',
  (select o.user_id::text from public.orders o where o.id = 'a7000000-0000-4000-8000-000000000072'),
  true
);
do $validation$
declare
  v_expiry timestamptz;
  v_blocked boolean := false;
begin
  begin
    v_expiry := public.reserve_order_inventory('a7000000-0000-4000-8000-000000000072');
  exception when sqlstate '23514' then
    v_blocked := true;
  end;
  if not v_blocked then
    raise exception 'FALHA: o segundo pedido também obteve a última unidade (expiração: %).', v_expiry;
  end if;
  raise notice 'PASS: a segunda sessão foi recusada porque a última unidade já estava retida.';
end;
$validation$;
commit;
