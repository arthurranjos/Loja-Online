# TASK-007 — Retenção concorrente e expiração de estoque

- **Estado:** DONE em 2026-11-09. O usuário aplicou a migration e executou o roteiro de concorrência/estado com sucesso.
- **Dependência:** TASK-006 DONE.
- **Requisitos:** RF-008; RN-003–RN-005; RNF-005.

## Decisão de escopo

O usuário escolheu manter o modelo aprovado com `inventory_reservations.order_id` e criar estrutura mínima de pedido nesta tarefa. A TASK-008 acrescentará checkout, snapshots/valores e pagamento.

## Implementação

- `orders` e `order_items` mínimos, com status já previstos no README; cliente só pode ler os próprios pedidos/itens, e escritas ficam reservadas às RPCs seguras.
- `inventory_reservations` com vínculo obrigatório ao pedido, quantidade positiva, estados `active/consumed/released/expired`, expiração, índices e unicidade por pedido/variação.
- `reserve_order_inventory(order_id)` exige cliente autenticado e e-mail confirmado, valida propriedade/status/itens, bloqueia variações em ordem estável, calcula unidades livres como estoque menos retenções ativas não vencidas e cria retenção de 15 minutos atomicamente.
- Chamadas repetidas para a mesma retenção ainda válida são idempotentes; retenção vencida é marcada `expired` e retorna sem reabrir o mesmo pedido.
- `release_order_inventory(order_id)` é interna (sem execução concedida ao cliente) para ser chamada na transação de recusa da TASK-008. Liberação não altera o saldo físico; aprovação consumirá reserva e baixará estoque uma vez na TASK-008.
- Valores de tempo usam relógio real após adquirir os locks, para que espera por concorrência não estenda retenção vencida nem encurte uma nova retenção.
- Sem cron, gateway ou serviço externo. `expires_at` deixa a unidade disponível imediatamente; uma RPC posterior faz a limpeza do estado persistido.

## Arquivos

- `supabase/migrations/20261109000003_inventory_reservations.sql`
- `supabase/validation/task-007-concurrency.sh` and its SQL fixture/session/transition/cleanup files
- `docs/architecture/data-model.md`
- `TASKS.md`

## Validação registrada

- `git diff --check` — passou (apenas avisos preexistentes de conversão LF/CRLF em outros arquivos).
- `npm run build` — passou.
- `npm run lint` — passou.
- `npx supabase migration up --local` — passou; usuário confirmou aplicação e banco atualizado.
- `bash supabase/validation/task-007-concurrency.sh` — passou. Saída confirmou que a segunda sessão foi recusada; idempotência, liberação, expiração simulada e saldo físico inalterado também passaram. O script removeu os pedidos/itens/reservas temporários.
- `npm run build`, `npm run lint`, `git diff --check` — passaram durante a revisão da implementação.

## Limites da tarefa

Pedido não é criado pela interface nesta etapa. A TASK-008 implementará a operação que cria pedido/itens e reserva estoque junto aos snapshots de preço, frete e pagamento.
