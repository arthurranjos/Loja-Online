\set ON_ERROR_STOP on
begin;
select v.id
from public.product_variants v
where v.sku = 'CAM-ESS-G-PR'
for update;
select pg_sleep(8);
select set_config(
  'request.jwt.claim.sub',
  (select o.user_id::text from public.orders o where o.id = 'a7000000-0000-4000-8000-000000000071'),
  true
);
select public.reserve_order_inventory('a7000000-0000-4000-8000-000000000071');
commit;
