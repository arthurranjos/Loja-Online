# TASK-012 — Implementar promoções de produto

## Identificação e prontidão

- **Objetivo:** Administrar descontos de produto com janela de início/término e preço consistente no catálogo/checkout.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-010
- **Rastreabilidade:** RF-014; RN-008
- **Bloqueios:** TASK-010 DONE; PD-005 resolvida; conflitos entre promoções definidos e decisões de preço aprovadas.
- **Scope Guard / Primary Changes:** Regras e interface para promoção de produto e cálculo/apresentação de preço promocional.
- **Allowed Changes:** Desconto de produto e datas aprovadas; integração de apresentação com catálogo/carrinho.
- **Forbidden Changes:** Cupons, acúmulo, limite presumido, regras complexas ou preço divergente no pedido.
- **Critérios de aceite:** Promoção vale somente no produto e intervalo configurados; fora da janela preço original; conflito/limite tratados conforme decisões aprovadas; pedido registra preço coerente.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-012-etapa-001-recontextualizacao.md`](prompt-task-012-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-012-etapa-002-contexto-historico.md`](prompt-task-012-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-012-etapa-003-validacao-pre-condicoes.md`](prompt-task-012-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-012-etapa-004-planejamento.md`](prompt-task-012-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-012-etapa-005-implementacao.md`](prompt-task-012-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-012-etapa-006-revisao.md`](prompt-task-012-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-012-etapa-007-testes-manuais.md`](prompt-task-012-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-012-etapa-008-conclusao.md`](prompt-task-012-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 antes da data inicial; M-002 dentro da janela; M-003 após data final; M-004 editar produto promovido e conferir consistência; M-005 duas promoções concorrentes seguem a regra aprovada; M-006 conferir subtotal/preço final e não acumulação.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Administração de promoções, catálogo e cálculo de preço identificados no planejamento; PD-005 e regra de conflito aprovada..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-010 DONE; PD-005 resolvida; conflitos entre promoções definidos e decisões de preço aprovadas.
- Acúmulo de descontos está fora do escopo inicial. O backlog marca limite de uso como pendente; manter bloqueado até decisão.
