# TASK-010 — Implementar painel e operações administrativas

## Identificação e prontidão

- **Objetivo:** Implementar painel para primeira conta administrativa e gestão de catálogo/estoque, pedidos e usuários.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-004, TASK-005, TASK-008
- **Rastreabilidade:** RF-012, RF-013, RF-017; RN-011
- **Bloqueios:** TASK-004, TASK-005 e TASK-008 DONE; fluxo seguro de bootstrap da primeira conta aprovado.
- **Scope Guard / Primary Changes:** Painel e operações administrativas RF-012/RF-013/RF-017, incluindo transições válidas e auditoria.
- **Allowed Changes:** Administrador com permissões iguais gerencia produtos, categorias, variações, estoque, pedidos e usuários.
- **Forbidden Changes:** Papéis adicionais, impersonação, bypass de autorização, promoções/relatórios/pós-venda fora da TASK, bootstrap público inseguro.
- **Critérios de aceite:** Primeira conta é provisionável com segurança; administradores têm mesmas permissões; cliente recebe negação; transições inválidas são recusadas; ações relevantes são auditáveis.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-010-etapa-001-recontextualizacao.md`](prompt-task-010-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-010-etapa-002-contexto-historico.md`](prompt-task-010-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-010-etapa-003-validacao-pre-condicoes.md`](prompt-task-010-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-010-etapa-004-planejamento.md`](prompt-task-010-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-010-etapa-005-implementacao.md`](prompt-task-010-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-010-etapa-006-revisao.md`](prompt-task-010-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-010-etapa-007-testes-manuais.md`](prompt-task-010-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-010-etapa-008-conclusao.md`](prompt-task-010-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 primeiro bootstrap só no mecanismo autorizado e sem endpoint público de elevação; M-002 admin cria/edita/remove produto/categoria/variação; M-003 atualiza estoque e observa variação correta; M-004 consulta/atualiza pedido por transição permitida; M-005 tentativa de transição inválida é recusada; M-006 cliente tenta operação administrativa; M-007 admin consulta/gerencia usuários sem expor credenciais; M-008 conferir auditoria sem segredo.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Painel/controle de acesso e módulos administrativos identificados na análise; mecanismo de bootstrap documentado..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-004, TASK-005 e TASK-008 DONE; fluxo seguro de bootstrap da primeira conta aprovado.
- Todos os administradores têm permissões equivalentes. Não adicionar roles ou fluxo de elevação. Usuários administrados não autorizam exposição de senha/token.
