create function public.admin_sales_report(p_start_date date, p_end_date date)
returns table (
  order_count bigint,
  product_net_cents text,
  shipping_cents text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_start timestamptz;
  v_end_exclusive timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;
  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then
    raise exception 'Informe um intervalo de datas válido.' using errcode = '22023';
  end if;

  v_start := p_start_date::timestamp at time zone 'America/Sao_Paulo';
  v_end_exclusive := (p_end_date + 1)::timestamp at time zone 'America/Sao_Paulo';

  return query
  select
    count(*)::bigint,
    coalesce(sum(o.subtotal_cents - o.discount_cents), 0)::text,
    coalesce(sum(o.shipping_cents), 0)::text
  from public.orders o
  join public.simulated_payments sp on sp.order_id = o.id and sp.outcome = 'approved'
  where o.payment_approved_at >= v_start
    and o.payment_approved_at < v_end_exclusive
    and o.status <> 'pedido_cancelado';
end;
$$;

revoke all on function public.admin_sales_report(date, date) from public, anon, authenticated;
grant execute on function public.admin_sales_report(date, date) to authenticated;
