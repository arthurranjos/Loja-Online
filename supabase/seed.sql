-- Dados apenas para desenvolvimento local. Nunca execute este arquivo em produção.
do $seed$
begin
with inserted_categories as (
  insert into public.categories (name, slug, active)
  values
    ('Roupas', 'roupas', true),
    ('Acessórios', 'acessorios', true)
  on conflict (slug) do update set name = excluded.name, active = excluded.active
  returning id, slug
)
insert into public.products (category_id, name, slug, description, price_cents, active)
select c.id, p.name, p.slug, p.description, p.price_cents, true
from (values
  ('roupas', 'Camiseta Essencial', 'camiseta-essencial', 'Camiseta confortável para compor combinações do dia a dia.', 8990::bigint),
  ('roupas', 'Calça Sarja Reta', 'calca-sarja-reta', 'Modelagem reta com tecido de toque macio.', 16990::bigint),
  ('roupas', 'Vestido Horizonte', 'vestido-horizonte', 'Vestido leve com caimento fluido.', 18990::bigint),
  ('acessorios', 'Bolsa Cotidiana', 'bolsa-cotidiana', 'Bolsa compacta para acompanhar a rotina.', 12990::bigint)
) as p(category_slug, name, slug, description, price_cents)
join inserted_categories c on c.slug = p.category_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  active = true;

insert into public.product_variants (product_id, size, color, sku, stock_on_hand, active)
select p.id, v.size, v.color, v.sku, v.stock_on_hand, true
from (values
  ('camiseta-essencial', 'P', 'Preto', 'CAM-ESS-P-PR', 5),
  ('camiseta-essencial', 'M', 'Preto', 'CAM-ESS-M-PR', 3),
  ('camiseta-essencial', 'G', 'Preto', 'CAM-ESS-G-PR', 1),
  ('camiseta-essencial', 'P', 'Areia', 'CAM-ESS-P-AR', 2),
  ('camiseta-essencial', 'M', 'Areia', 'CAM-ESS-M-AR', 0),
  ('calca-sarja-reta', '38', 'Oliva', 'CAL-SAR-38-OL', 2),
  ('calca-sarja-reta', '40', 'Oliva', 'CAL-SAR-40-OL', 4),
  ('calca-sarja-reta', '42', 'Oliva', 'CAL-SAR-42-OL', 1),
  ('vestido-horizonte', 'P', 'Terracota', 'VES-HOR-P-TE', 2),
  ('vestido-horizonte', 'M', 'Terracota', 'VES-HOR-M-TE', 3),
  ('vestido-horizonte', 'G', 'Terracota', 'VES-HOR-G-TE', 1),
  ('bolsa-cotidiana', 'Único', 'Caramelo', 'BOL-COT-U-CA', 4)
) as v(product_slug, size, color, sku, stock_on_hand)
join public.products p on p.slug = v.product_slug
on conflict (product_id, size, color) do update set
  sku = excluded.sku,
  stock_on_hand = excluded.stock_on_hand,
  active = true;

insert into public.product_images (product_id, image_path, alt_text, position)
select p.id, '/products/placeholder.svg', 'Imagem ilustrativa de ' || p.name, 0
from public.products p
where p.slug in ('camiseta-essencial', 'calca-sarja-reta', 'vestido-horizonte', 'bolsa-cotidiana')
on conflict (product_id, position) do update set
  image_path = excluded.image_path,
  alt_text = excluded.alt_text;
end;
$seed$;
