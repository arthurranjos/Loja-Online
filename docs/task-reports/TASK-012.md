# TASK-012 — Promoções de produto

- **Estado:** DONE em 2026-11-10. O usuário confirmou que aplicou a migration e que as promoções estão funcionando.
- **Regras:** promoção por produto, percentual ou valor fixo em centavos, com janela `[starts_at, ends_at)`. Promoção ativa concorrente escolhe o maior desconto efetivo; empate escolhe o início mais recente; desconto é limitado ao preço de tabela. Sem acumulação ou limite de usos.
- **Banco e segurança:** migration `20261109000009_product_promotions.sql` cria tabela com RLS administrativo, auditoria, cálculo de preço atual, view pública de preços sem divulgação de promoções futuras e recálculo autoritativo no checkout. Checkout salva preço de tabela, desconto total por linha e promoção aplicada.
- **Interface:** painel administrativo cria/edita/ativa/desativa promoções; catálogo, detalhe, filtros, carrinho e checkout exibem preço promocional e totais consistentes. Datas são informadas no horário local do navegador e persistidas como instantes.
- **Arquivos principais:** `supabase/migrations/20261109000009_product_promotions.sql`, `src/features/admin/AdminPanel.tsx`, `src/features/catalog/CatalogPage.tsx`, `src/features/catalog/CatalogPage.css`, `README.md`, `docs/architecture/data-model.md`.
- **Validação executada:** `npm run build` passou (Vite reportou chunk principal de 514.07 kB, acima do aviso padrão de 500 kB); `npm run lint` passou; `git diff --check` passou.
- **Validação manual:** usuário confirmou funcionamento após aplicação local da migration. Build, lint e diff check passaram antes da validação manual.
