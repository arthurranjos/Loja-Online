create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 120),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipient_name text not null check (char_length(btrim(recipient_name)) between 2 and 120),
  postal_code text not null check (postal_code ~ '^[0-9]{8}$'),
  street text not null check (char_length(btrim(street)) between 2 and 160),
  street_number text not null check (char_length(btrim(street_number)) between 1 and 30),
  complement text check (complement is null or char_length(complement) <= 120),
  district text not null check (char_length(btrim(district)) between 2 and 100),
  city text not null check (char_length(btrim(city)) between 2 and 100),
  state text not null check (state in (
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  )),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_created_at_idx on public.addresses (user_id, created_at);
create unique index addresses_one_default_per_user_idx
  on public.addresses (user_id) where is_default;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  requested_address jsonb := new.raw_user_meta_data -> 'address';
begin
  if char_length(requested_name) not between 2 and 120 then
    raise exception 'Nome do perfil inválido.' using errcode = '23514';
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, requested_name);

  if jsonb_typeof(requested_address) is distinct from 'object' then
    raise exception 'Endereço inicial obrigatório.' using errcode = '23514';
  end if;

  insert into public.addresses (
    user_id, recipient_name, postal_code, street, street_number,
    complement, district, city, state, is_default
  ) values (
    new.id,
    btrim(coalesce(requested_address ->> 'recipient_name', requested_name)),
    regexp_replace(coalesce(requested_address ->> 'postal_code', ''), '[^0-9]', '', 'g'),
    btrim(coalesce(requested_address ->> 'street', '')),
    btrim(coalesce(requested_address ->> 'street_number', '')),
    nullif(btrim(coalesce(requested_address ->> 'complement', '')), ''),
    btrim(coalesce(requested_address ->> 'district', '')),
    btrim(coalesce(requested_address ->> 'city', '')),
    upper(btrim(coalesce(requested_address ->> 'state', ''))),
    true
  );

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.addresses from anon, authenticated;
grant select (id, full_name, role, created_at, updated_at) on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;

create policy "Customers can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Customers can update their own profile name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Customers can read their own addresses"
on public.addresses for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Customers can create their own addresses"
on public.addresses for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Customers can update their own addresses"
on public.addresses for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Customers can delete their own addresses"
on public.addresses for delete to authenticated
using ((select auth.uid()) = user_id);
