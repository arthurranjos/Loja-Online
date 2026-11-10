# TASK-009 — Conta do cliente e fluxo de pedidos

- **Estado:** DONE em 2026-11-09 após o usuário confirmar histórico, detalhes, atualização e isolamento entre contas.
- **Dependência:** TASK-008 DONE.
- **Requisitos:** RF-002, RF-010; RN-002, RN-012; RNF-003.

## Entregue

- A conta lista os próprios pedidos em ordem recente, com estado atual, data, total e detalhes expansíveis.
- Detalhes mostram itens e variações, snapshot do endereço, subtotal/descontos/frete/total, motivo de recusa, aprovação e linha do tempo de status.
- Botão Atualizar recarrega os dados do perfil, endereços e pedidos para refletir mudanças de status.
- A consulta filtra pelo usuário da sessão, e RLS de `orders`, `order_items`, `simulated_payments` e `order_status_history` também limita leitura ao proprietário.
- Ao sair da conta, o estado local de pedidos é limpo.
- Solicitações de troca/cancelamento/devolução e notificações por e-mail não foram incluídas; pertencem a etapas posteriores.

## Arquivos

- `src/features/auth/AuthPage.tsx`
- `src/App.css`
- `TASKS.md`

## Validação registrada

- `npm run build` — passou.
- `npm run lint` — passou sem avisos.
- `git diff --check` — passou (avisos de conversão LF/CRLF preexistentes nos documentos).
- Usuário confirmou lista/histórico, detalhes e isolamento entre contas.
