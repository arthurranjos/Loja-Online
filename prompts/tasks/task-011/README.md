# TASK-011 — Implementar solicitações pós-venda

## Identificação e prontidão

- **Objetivo:** Registrar pedidos de cancelamento, troca e devolução e permitir decisão administrativa conforme política aprovada.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-009, TASK-010
- **Rastreabilidade:** RF-011, RF-013; RN-010
- **Bloqueios:** TASK-009 e TASK-010 DONE; PD-004 resolvida com prazos/condições/decisão e consequências aprovadas.
- **Scope Guard / Primary Changes:** Solicitação, elegibilidade temporal, decisão administrativa e histórico de pós-venda.
- **Allowed Changes:** Fluxos aprovados e estados necessários, estritamente dentro da política documentada.
- **Forbidden Changes:** Inferir prazo/condição, reembolso financeiro real, alterar política, aprovar automaticamente ou apagar histórico.
- **Critérios de aceite:** Elegibilidade segue prazo e condição aprovados; cliente solicita; admin decide; histórico/status são preservados; acessos isolados.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-011-etapa-001-recontextualizacao.md`](prompt-task-011-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-011-etapa-002-contexto-historico.md`](prompt-task-011-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-011-etapa-003-validacao-pre-condicoes.md`](prompt-task-011-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-011-etapa-004-planejamento.md`](prompt-task-011-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-011-etapa-005-implementacao.md`](prompt-task-011-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-011-etapa-006-revisao.md`](prompt-task-011-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-011-etapa-007-testes-manuais.md`](prompt-task-011-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-011-etapa-008-conclusao.md`](prompt-task-011-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 solicitar cada tipo em caso elegível; M-002 tentar após prazo/condição não elegível; M-003 administrador aprova e rejeita conforme opções; M-004 duplicidade e solicitação repetida; M-005 cliente não consulta pedido alheio; M-006 confirmar estoque/financeiro só mudam conforme política aprovada.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Portal de pedidos e painel administrativo; política de PD-004 aprovada; entidades/transições aprovadas..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-009 e TASK-010 DONE; PD-004 resolvida com prazos/condições/decisão e consequências aprovadas.
- Sem política fechada, mantenha bloqueado. Não inferir devolução legal ou gerar reembolso real.
