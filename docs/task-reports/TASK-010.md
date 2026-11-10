# TASK-010 — Painel e operações administrativas

- **Estado:** DONE em 2026-11-09. Usuário aplicou a migration, executou o bootstrap da conta confirmada e confirmou que painel e operações estão funcionando.
- **Entregue:** painel visível apenas à conta com papel `admin`; criação/edição e ativação de categorias e produtos; criação e ativação de variações; alteração de estoque pelo RPC transacional; consulta de pedidos e usuários; avanço auditável pelos estados permitidos.
- **Segurança:** bootstrap inicial requer conta confirmada, é serializado e só pode ser executado por operador confiável do banco; não há autoelevação pública. Clientes sem papel administrativo não passam pelas políticas/RPCs. Estoque não pode ser reduzido abaixo de retenções ativas. Acesso a e-mails dos usuários ocorre apenas via RPC com checagem administrativa.
- **Limites preservados:** nenhuma transição de cancelamento ou estorno foi adicionada; nenhuma permissão administrativa pode ser modificada pela interface; dados de pagamento são simulados. Variações são arquivadas (desativadas), evitando remoção acidental de referências em carrinhos/pedidos.
- **Arquivos principais:** `supabase/migrations/20261109000005_admin_operations.sql`, `src/features/admin/AdminPanel.tsx`, `src/features/admin/AdminPanel.css`, `src/features/auth/AuthPage.tsx`, `src/App.css`.
- **Validação executada:** `npm run build` passou; `npm run lint` passou; `git diff --check` passou.
- **Validação manual:** migration `20261109000005_admin_operations.sql` aplicada com sucesso; `bootstrap_initial_admin` retornou o UUID escolhido; usuário confirmou painel e operações administrativas funcionando.
