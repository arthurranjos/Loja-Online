# ADR-003: Valores monetários em centavos inteiros

- **Status:** Aceita pelo usuário
- **Data:** 2026-11-09
- **Decisor/evidência:** usuário escolheu a opção recomendada “Centavos inteiros”; decisão registrada durante a TASK-005.
- **Rastreabilidade:** TASK-005–TASK-014; RF-004–RF-016; RN-007, RN-008, RN-013.

## Contexto

O modelo precisa persistir preços, frete, descontos e totais e expor esses valores à interface. Representação decimal ou ponto flutuante pode gerar arredondamentos inconsistentes entre consultas e cálculos.

## Decisão

- Armazenar valores monetários como centavos inteiros em colunas PostgreSQL `bigint` com sufixo `_cents`.
- Trafegar valores monetários como inteiros em centavos nos contratos da aplicação.
- Converter entradas de reais em centavos com parsing decimal determinístico; converter para `R$` somente na camada de apresentação.
- Aplicar a mesma convenção a preço de produto, itens de pedido, descontos, frete, subtotal e total.

## Alternativas consideradas

1. Centavos inteiros (`bigint`) — escolhido pelo usuário; evita operações monetárias em ponto flutuante e oferece ampla faixa de valores.
2. `numeric(12,2)` em reais — alternativa válida, mas não escolhida.

## Consequências

- Filtros/ordenações monetários usam centavos inteiros.
- Validação converte entradas decimais em reais para inteiro sem depender de `Number` binário; cálculos de pedido devem preservar inteiros.
- A UI usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` após converter o inteiro para unidades de exibição.
- Migrações e APIs devem manter os nomes com sufixo `_cents`; nenhum campo monetário futuro deve introduzir `float` ou misturar unidades.
