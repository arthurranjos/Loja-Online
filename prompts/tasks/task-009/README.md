# TASK-009 — Implementar conta do cliente e fluxo de pedidos

## Identificação e prontidão

- **Objetivo:** Exibir conta, histórico, detalhes e atualizações de pedidos; não antecipar pós-venda dependente de PD-004.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-008
- **Rastreabilidade:** RF-002, RF-010
- **Bloqueios:** TASK-008 DONE e estados/histórico do pedido disponíveis.
- **Scope Guard / Primary Changes:** Área autenticada do cliente, histórico de pedidos, detalhe e estados aprovados.
- **Allowed Changes:** Visualização de perfil/endereço e pedidos do próprio cliente; atualizações internas à conta.
- **Forbidden Changes:** Notificação por e-mail, pedido de troca/devolução sem regra aprovada, acesso entre clientes, novos estados.
- **Critérios de aceite:** Cliente consulta apenas próprios pedidos; estados exibidos correspondem ao histórico registrado; confirmação/atualização aparece dentro da conta.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-009-etapa-001-recontextualizacao.md`](prompt-task-009-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-009-etapa-002-contexto-historico.md`](prompt-task-009-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-009-etapa-003-validacao-pre-condicoes.md`](prompt-task-009-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-009-etapa-004-planejamento.md`](prompt-task-009-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-009-etapa-005-implementacao.md`](prompt-task-009-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-009-etapa-006-revisao.md`](prompt-task-009-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-009-etapa-007-testes-manuais.md`](prompt-task-009-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-009-etapa-008-conclusao.md`](prompt-task-009-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 cliente sem pedidos vê estado vazio adequado; M-002 cliente consulta pedido e histórico; M-003 simular as transições permitidas e confirmar atualização no portal; M-004 cliente A tenta abrir pedido de B e recebe negação; M-005 conta não confirmada/não autenticada é tratada conforme regras; M-006 confirmar que não é enviado e-mail.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Portal/área autenticada e consultas de pedidos identificados no planejamento; RF-010..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-008 DONE e estados/histórico do pedido disponíveis.
- RF-011 é TASK-011; não habilitar solicitações pós-venda sem PD-004.
