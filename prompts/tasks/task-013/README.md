# TASK-013 — Implementar avaliações verificadas e moderação

## Identificação e prontidão

- **Objetivo:** Permitir avaliação por cliente que comprou o produto e moderação/ocultação administrativa.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-009, TASK-010
- **Rastreabilidade:** RF-015; RN-009
- **Bloqueios:** TASK-009 e TASK-010 DONE; fonte de prova da compra concluída definida pelo modelo de pedidos.
- **Scope Guard / Primary Changes:** Avaliação com nota/comentário, verificação de compra, unicidade e fluxo de moderação.
- **Allowed Changes:** RF-015 e visibilidade correspondente na página do produto.
- **Forbidden Changes:** Avaliação por não comprador, mais de uma por cliente/produto, expor dados privados ou permitir moderação por cliente.
- **Critérios de aceite:** Compra elegível é comprovada; unicidade cliente/produto; nota e comentário são armazenados; admin pode moderar/ocultar; conteúdo oculto respeita visibilidade.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-013-etapa-001-recontextualizacao.md`](prompt-task-013-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-013-etapa-002-contexto-historico.md`](prompt-task-013-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-013-etapa-003-validacao-pre-condicoes.md`](prompt-task-013-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-013-etapa-004-planejamento.md`](prompt-task-013-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-013-etapa-005-implementacao.md`](prompt-task-013-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-013-etapa-006-revisao.md`](prompt-task-013-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-013-etapa-007-testes-manuais.md`](prompt-task-013-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-013-etapa-008-conclusao.md`](prompt-task-013-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 comprador envia avaliação; M-002 não comprador tenta e recebe bloqueio; M-003 mesmo comprador tenta duplicar; M-004 admin modera e oculta; M-005 cliente verifica visibilidade da avaliação ocultada; M-006 validar entrada de nota/comentário e isolamento de identidade.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Módulos de avaliação, pedido e moderação identificados no planejamento..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-009 e TASK-010 DONE; fonte de prova da compra concluída definida pelo modelo de pedidos.
- Uma avaliação por cliente e produto comprado. Não inventar escala de nota ou regra de edição após envio; escalar se indispensável e não definida.
