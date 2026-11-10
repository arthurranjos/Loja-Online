create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 5 and 2000),
  status text not null default 'hidden' check (status in ('visible', 'hidden')),
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index reviews_product_visible_created_idx
  on public.reviews (product_id, created_at desc) where status = 'visible';
create index reviews_user_created_idx on public.reviews (user_id, created_at desc);
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();
create or replace function public.audit_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_entity_id uuid;
begin
  if tg_op = 'DELETE' then v_row := to_jsonb(old); else v_row := to_jsonb(new); end if;
  v_entity_id := (v_row ->> 'id')::uuid;
  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when tg_table_name = 'reviews' then 'review.submitted' else 'catalog.' || lower(tg_op) end,
    tg_table_name,
    v_entity_id,
    case when tg_table_name = 'reviews'
      then jsonb_build_object('rating', v_row -> 'rating', 'status', v_row -> 'status')
      else '{}'::jsonb end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.audit_catalog_change() from public, anon, authenticated;
create trigger reviews_audit_submissions after insert on public.reviews
for each row execute function public.audit_catalog_change();

alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;

create policy "Public can read visible product reviews"
on public.reviews for select to anon, authenticated
using (status = 'visible');
create policy "Customers can read their own product reviews"
on public.reviews for select to authenticated
using (user_id = (select auth.uid()));
create policy "Admins can read all product reviews"
on public.reviews for select to authenticated
using ((select public.is_admin()));

create function public.submit_product_review(p_product_id uuid, p_rating integer, p_comment text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_review_id uuid;
  v_comment text := btrim(coalesce(p_comment, ''));
begin
  if v_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '28000';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'A nota deve estar entre 1 e 5.' using errcode = '23514';
  end if;
  if char_length(v_comment) < 5 or char_length(v_comment) > 2000 then
    raise exception 'O comentário deve ter entre 5 e 2000 caracteres.' using errcode = '23514';
  end if;
  if not exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants v on v.id = oi.variant_id
    where o.user_id = v_user_id and o.status = 'entregue'
      and v.product_id = p_product_id
  ) then
    raise exception 'A avaliação fica disponível após a entrega de uma compra deste produto.' using errcode = '42501';
  end if;

  insert into public.reviews (user_id, product_id, rating, comment, status)
  values (v_user_id, p_product_id, p_rating, v_comment, 'hidden')
  returning id into v_review_id;
  return v_review_id;
exception
  when unique_violation then
    raise exception 'Você já enviou uma avaliação para este produto.' using errcode = '23505';
end;
$$;

create function public.admin_moderate_review(p_review_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'Permissão administrativa necessária.' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('visible', 'hidden') then
    raise exception 'Estado de moderação inválido.' using errcode = '22023';
  end if;

  update public.reviews r
  set status = p_status, moderated_by = v_actor, moderated_at = clock_timestamp()
  where r.id = p_review_id;
  if not found then
    raise exception 'Avaliação não encontrada.' using errcode = 'P0002';
  end if;
  insert into public.audit_events (actor_user_id, action, entity_type, entity_id, metadata)
  values (v_actor, 'review.moderate', 'reviews', p_review_id, jsonb_build_object('status', p_status));
  return p_status;
end;
$$;

revoke all on function public.submit_product_review(uuid, integer, text) from public, anon, authenticated;
revoke all on function public.admin_moderate_review(uuid, text) from public, anon, authenticated;
grant execute on function public.submit_product_review(uuid, integer, text) to authenticated;
grant execute on function public.admin_moderate_review(uuid, text) to authenticated;
