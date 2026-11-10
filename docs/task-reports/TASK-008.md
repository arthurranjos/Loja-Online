# TASK-008 — Checkout e pagamento simulado

- **Estado:** DONE em 2026-11-09 após confirmação do usuário dos fluxos de recusa, motivo, repetição, aprovação e atualização do carrinho.
- **Dependência:** TASK-007 DONE.
- **Requisitos:** RF-006, RF-009, RF-010; RN-002, RN-004–RN-006; RNF-007; ADR-003.

## Implementação

- Migração completa o snapshot do pedido/endereço/itens, totais em centavos, pagamento simulado único por pedido e histórico de status.
- RPC de checkout valida identidade e e-mail confirmado, endereço próprio, carrinho não vazio e catálogo ativo; captura preços e frete no servidor, cria pedido e reserva estoque dentro da mesma transação.
- Repetir checkout para o mesmo carrinho enquanto a retenção estiver ativa retoma o pedido existente.
- Cliente escolhe aprovado/recusado. Aprovação consome a reserva, baixa estoque uma única vez e remove do carrinho as unidades compradas. Recusa registra motivo e libera a reserva, mantendo itens no carrinho.
- Aprovação depois da expiração é registrada como recusada; nenhuma unidade é baixada.
- Pagamento é idempotente por pedido; resultado já registrado é devolvido em repetições, sem aceitar uma decisão diferente nem duplicar baixa.
- Sem gateway real, campos de cartão, ou dados financeiros reais.

## Arquivos

- `supabase/migrations/20261109000004_checkout_simulated_payment.sql`
- `supabase/validation/task-008-expiry.sql`
- `src/features/catalog/CatalogPage.tsx`
- `src/features/catalog/CatalogPage.css`
- `docs/architecture/data-model.md`
- `docs/architecture/overview.md`
- `docs/diagrams/order-flow.mmd`
- `TASKS.md`

## Validação registrada

- `npm run build` — passou.
- `npm run lint` — passou sem avisos.
- `git diff --check` — passou.
- `npx supabase migration up --local` — passou; usuário confirmou aplicação e banco atualizado.
- `npx supabase db query --file supabase/validation/task-008-expiry.sql` — passou (`DO`, sem exceção). O roteiro valida aprovação tardia, repetição com decisão conflitante, idempotência e saldo sem precisar esperar 15 minutos.
- Usuário confirmou os fluxos manuais de recusa, motivo, manutenção do carrinho, aprovação, limpeza do carrinho e repetição pela interface.
