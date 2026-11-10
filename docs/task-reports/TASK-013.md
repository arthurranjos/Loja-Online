# TASK-013 — Avaliações verificadas e moderação

- **Estado:** DONE em 2026-11-09. Usuário aplicou a migration e confirmou o fluxo de avaliação e moderação.
- **Elegibilidade:** RPC autenticada só aceita avaliação quando há item do produto em pedido do cliente com status `entregue`. Uma restrição única impede mais de uma avaliação por cliente/produto. Nota deve ser de 1 a 5; comentário de 5 a 2000 caracteres.
- **Moderação:** submissões iniciam ocultas; apenas avaliações aprovadas ficam visíveis no detalhe público do produto. O painel administrativo permite aprovar e ocultar; ação fica em `audit_events`. Cliente consulta o estado da própria avaliação.
- **Isolamento:** RLS expõe avaliações visíveis ao público, avaliações próprias ao cliente e todas as avaliações ao administrador. Inserção e moderação passam por RPCs com validação de identidade/papel; não há escrita direta pela API.
- **Arquivos principais:** `supabase/migrations/20261109000006_verified_reviews.sql`, `src/features/auth/AuthPage.tsx`, `src/features/catalog/CatalogPage.tsx`, `src/features/admin/AdminPanel.tsx`, CSS associado, `README.md` e `docs/architecture/data-model.md`.
- **Validação executada:** `npm run build` passou; `npm run lint` passou; `git diff --check` passou.
- **Validação manual:** migration `20261109000006_verified_reviews.sql` aplicada com sucesso; usuário confirmou que avaliação e moderação passaram.
