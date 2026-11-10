# TASK-006 — Carrinho e cálculo de frete

- **Estado:** DONE em 2026-11-09, conforme `TASKS.md` e confirmação posterior do usuário de que o fluxo de carrinho/frete estava funcionando. Esta atualização reconcilia o relatório, cujo texto anterior ficou desatualizado.
- **Requisitos:** RF-005–RF-007; RN-007; ADR-003.

## Entregue

- Persistência de um carrinho por conta e itens por variação, com quantidade positiva.
- RLS permite a cada cliente ler somente o próprio carrinho. Escritas são RPCs autenticadas que verificam o dono pela sessão; o browser não recebe permissão direta de escrita.
- Adição de variação disponível, alteração de quantidade e remoção de item. A ação não retém estoque; a disponibilidade será validada/retida nas tarefas de checkout e estoque.
- Painel de carrinho responsivo com subtotal, frete e total em centavos inteiros; seleção entre endereços salvos.
- RPC de frete valida que o endereço pertence ao cliente e CEP tem oito dígitos, aplicando os valores aprovados em RN-007 pela UF.
- Sem integração postal ou serviço externo.

## Arquivos

- `supabase/migrations/20261109000002_cart_shipping.sql`
- `src/features/catalog/CatalogPage.tsx`
- `src/features/catalog/CatalogPage.css`
- `docs/architecture/data-model.md`
- `TASKS.md`

## Validação registrada

- `npm run build` — passou (TypeScript e build Vite).
- `npm run lint` — passou sem avisos.
- `npx supabase migration up --local` — passou; usuário confirmou `Applying migration 20261109000002_cart_shipping.sql... Local database is up to date.`
- Usuário confirmou que o fluxo estava funcionando; revisão final de tamanhos de viewport está sendo feita na TASK-015.

## Cenários manuais originalmente previstos

1. Aplicar migration `20261109000002_cart_shipping.sql` no Supabase local.
2. Entrar, adicionar uma variação e confirmar persistência após fechar/reabrir o carrinho.
3. Aumentar/diminuir quantidade e remover item; conferir carrinho vazio.
4. Usar CEP de UF do Sudeste e conferir R$ 15,00; testar ao menos uma UF de cada outra região e conferir R$ 20,00, R$ 25,00, R$ 30,00 e R$ 40,00.
5. Escolher outro endereço e conferir que a tarifa acompanha a UF. CEP inválido deve ser rejeitado pela validação do endereço/banco; não há endereço inválido persistível no modelo atual.
6. Conferir subtotal como preço vigente × quantidade e total como subtotal + frete.

## Limites

O carrinho não reserva estoque e não garante disponibilidade até o checkout. A migration só lê estoque para impedir adição de variação atualmente sem unidades; concorrência e retenção pertencem à TASK-007.
