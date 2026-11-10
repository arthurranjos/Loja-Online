# TASK-007 — Implementar retenção concorrente e expiração de estoque

## Identificação e prontidão

- **Objetivo:** Impedir sobrealocação por produto/variação com retenções exclusivas, temporárias e expiráveis.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-006
- **Rastreabilidade:** RF-008; RN-003–RN-005; RNF-005
- **Bloqueios:** TASK-006 DONE; PD-002 resolvida; mecanismo transacional e expiração aprovados; ambiente concorrente disponível.
- **Scope Guard / Primary Changes:** Serviço transacional de disponibilidade, retenção e expiração para estoque por produto/tamanho/cor.
- **Allowed Changes:** Estoque por variação, registros/estados de retenção e mecanismo de expiração aprovado.
- **Forbidden Changes:** Estoque negativo, duas retenções da mesma unidade, retenção eterna, duração inventada ou baixa duplicada.
- **Critérios de aceite:** Corrida pela última unidade concede uma retenção; recusa/expiração libera estoque; aprovação baixa uma única vez; transições repetidas são seguras; comportamento de aprovação tardia após expiração é definido e testado.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-007-etapa-001-recontextualizacao.md`](prompt-task-007-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-007-etapa-002-contexto-historico.md`](prompt-task-007-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-007-etapa-003-validacao-pre-condicoes.md`](prompt-task-007-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-007-etapa-004-planejamento.md`](prompt-task-007-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-007-etapa-005-implementacao.md`](prompt-task-007-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-007-etapa-006-revisao.md`](prompt-task-007-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-007-etapa-007-testes-manuais.md`](prompt-task-007-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-007-etapa-008-conclusao.md`](prompt-task-007-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 dois checkouts simultâneos competem pela última unidade e apenas um retém; M-002 cliente desiste e retenção expira conforme PD-002; M-003 recusa libera quantidade; M-004 aprovação consome uma vez; M-005 repetir/liberar/expirar novamente não duplica unidades; M-006 aprovação tardia após expiração é recusada/encaminhada segundo regra aprovada; M-007 verificar estoque nunca negativo.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Serviço de estoque/retentores e transação identificados no planejamento; agendador apenas se aprovado; documentação de PD-002..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-006 DONE; PD-002 resolvida; mecanismo transacional e expiração aprovados; ambiente concorrente disponível.
- Exigir evidência manual reproduzível de concorrência. Automação de teste, se houver, é evidência adicional e não substitui execução manual nem o gate manual.
