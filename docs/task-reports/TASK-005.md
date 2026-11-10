# Relatório — TASK-005

- **Tarefa:** Implementar catálogo, busca, filtros e variações.
- **Estado:** DONE em 2026-11-09; usuário aplicou migration/seed e confirmou todos os cenários da interface.
- **Dependência:** TASK-003 DONE.
- **Convenção monetária:** centavos inteiros, aprovada pelo usuário e registrada em `docs/adr/ADR-003-monetary-values.md`.
- **Branch:** `codex/task-003-local-supabase`; branch específica não está disponível porque `.git` é somente leitura para o workspace.

## Implementado

- Tabelas `categories`, `products`, `product_variants` e `product_images`; preço é `bigint` em centavos e estoque é não negativo por tamanho/cor.
- RLS permite leitura pública somente de categorias/produtos/imagens ativos. Clientes não têm escrita direta nesta etapa.
- View pública `catalog_product_variants` expõe tamanho, cor e disponibilidade booleana; não expõe SKU nem quantidade de estoque.
- Catálogo responsivo com busca por nome/descrição, filtros combináveis por categoria/tamanho/cor e faixa de preço; estado sem resultados e limpeza de filtros.
- Detalhe mostra descrição, preço em reais formatado e disponibilidade de cada variação.
- Imagens restritas a caminhos locais `/products/`, com placeholder local. Sem upload ou serviço externo; decisão de storage permanece pendente.
- Dados de demonstração isolados em `supabase/seed.sql`, idempotentes e aplicáveis ao banco local sem limpar contas existentes.
- Administração de escrita de catálogo permanece no escopo administrativo da TASK-010.

## Validações executadas

- `npm run build` — passou com catálogo e tela de detalhe.
- `npm run lint` — passou sem avisos.
- `git diff --check` — passou, com avisos LF/CRLF já existentes.
- Revisão estática confirmou que não há grants públicos de escrita, que variantes não expõem contagem de estoque e que as imagens não aceitam URLs externas.
- Usuário executou `npx supabase db query --file supabase/seed.sql` — retornou `DO`.
- Usuário consultou `select name, price_cents from public.products order by name` — confirmou Bolsa Cotidiana (12990), Calça Sarja Reta (16990), Camiseta Essencial (8990) e Vestido Horizonte (18990).
- Usuário confirmou: lista inicial com quatro produtos; busca; filtro combinado; faixa de preços; cenário sem resultados; detalhe de produto e variação indisponível.

Nenhuma migration ou seed foi executada contra projeto hospedado. Nenhum commit foi criado.
