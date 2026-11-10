# TASK-008 — Implementar pagamento simulado e criação consistente de pedido

## Identificação e prontidão

- **Objetivo:** Registrar a escolha de aprovação/recusa simulada e criar/transicionar pedido sem inconsistência em pagamento/estoque.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-007
- **Rastreabilidade:** RF-006, RF-009, RF-010; RN-004–RN-006
- **Bloqueios:** TASK-007 DONE; fluxo de retenção e expiração definido; pedido e estados aprovados.
- **Scope Guard / Primary Changes:** Adaptador de pagamento simulado, estados do pedido/pagamento, motivo de recusa e histórico.
- **Allowed Changes:** Estados do README, retorno simulado, criação de pedido e coordenação com retenção.
- **Forbidden Changes:** Gateway real, captura/dados financeiros reais, estados novos de negócio ou repetição que duplique baixa/pedido.
- **Critérios de aceite:** Aprovação confirma pedido e estoque uma vez; recusa exibe motivo e libera retenção; reenvio/repetição é idempotente; histórico/status é coerente.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-008-etapa-001-recontextualizacao.md`](prompt-task-008-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-008-etapa-002-contexto-historico.md`](prompt-task-008-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-008-etapa-003-validacao-pre-condicoes.md`](prompt-task-008-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-008-etapa-004-planejamento.md`](prompt-task-008-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-008-etapa-005-implementacao.md`](prompt-task-008-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-008-etapa-006-revisao.md`](prompt-task-008-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-008-etapa-007-testes-manuais.md`](prompt-task-008-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-008-etapa-008-conclusao.md`](prompt-task-008-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 pagamento aprovado dentro da retenção; M-002 pagamento recusado com motivo visível; M-003 duplo envio da decisão não duplica pedido nem baixa; M-004 expiração antes da aprovação impede consumo tardio; M-005 falha no meio do fluxo não deixa pedido/pagamento/estoque divergentes; M-006 valor/endereço/itens do pedido refletem resumo confirmado.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Adaptador de simulação, fluxo de checkout/pedido e transições de retenção identificados no planejamento..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-007 DONE; fluxo de retenção e expiração definido; pedido e estados aprovados.
- Simulação é escolhida pelo cliente na demonstração. Não conectar gateway real nem registrar dados financeiros.
