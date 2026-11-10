# TASK-014 — Implementar relatório de vendas

## Identificação e prontidão

- **Objetivo:** Exibir relatório administrativo com métricas e filtros formalmente definidos.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-010
- **Rastreabilidade:** RF-016
- **Bloqueios:** TASK-010 DONE; PD-006 resolvida com métricas, período, filtros, definições de venda e autorização.
- **Scope Guard / Primary Changes:** Consultas e interface de relatório de vendas.
- **Allowed Changes:** Métricas/filtros aprovados e otimização apoiada por evidência.
- **Forbidden Changes:** Definição inventada de venda, dados pessoais desnecessários, acesso de cliente ou exportação não aprovada.
- **Critérios de aceite:** Totais e filtros seguem definições aprovadas; resultados reconciliáveis com pedidos fonte; acesso apenas administrativo.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-014-etapa-001-recontextualizacao.md`](prompt-task-014-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-014-etapa-002-contexto-historico.md`](prompt-task-014-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-014-etapa-003-validacao-pre-condicoes.md`](prompt-task-014-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-014-etapa-004-planejamento.md`](prompt-task-014-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-014-etapa-005-implementacao.md`](prompt-task-014-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-014-etapa-006-revisao.md`](prompt-task-014-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-014-etapa-007-testes-manuais.md`](prompt-task-014-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-014-etapa-008-conclusao.md`](prompt-task-014-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 conjunto pequeno de pedidos conhecido e total esperado calculável manualmente; M-002 filtrar períodos/estados conforme decisão; M-003 pedidos recusados/cancelados tratados conforme definição; M-004 cliente tenta acessar relatório; M-005 comparar agregados com dados-fonte e validar fuso/moeda quando definido.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Consultas/interface de relatório e registros de pedidos identificados no planejamento; definição PD-006 aprovada..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-010 DONE; PD-006 resolvida com métricas, período, filtros, definições de venda e autorização.
- Métricas/filtros ainda pendentes no backlog. Bloquear implementação sem PD-006; não decidir silenciosamente o que conta como venda.
