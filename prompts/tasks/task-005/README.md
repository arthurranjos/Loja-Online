# TASK-005 — Implementar catálogo, busca, filtros e variações

## Identificação e prontidão

- **Objetivo:** Implementar consulta de catálogo e administração do catálogo/variações no limite do backlog desta TASK.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-003
- **Rastreabilidade:** RF-003, RF-004, RF-012; RN-003
- **Bloqueios:** TASK-003 DONE, TASK-002 DONE e modelo de produto/variação aprovado.
- **Scope Guard / Primary Changes:** Domínio e interface do catálogo, categorias, produtos e variações de tamanho/cor.
- **Allowed Changes:** Produto, categoria, tamanho, cor, imagens e consultas de catálogo.
- **Forbidden Changes:** Promoções, checkout, mutação transacional de estoque além da configuração de catálogo, critérios/filtros extras inventados.
- **Critérios de aceite:** Navegação por categoria, pesquisa por nome, filtros por categoria/tamanho/cor/preço e detalhes com imagens/preço/disponibilidade por variação funcionam conforme requisitos.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-005-etapa-001-recontextualizacao.md`](prompt-task-005-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-005-etapa-002-contexto-historico.md`](prompt-task-005-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-005-etapa-003-validacao-pre-condicoes.md`](prompt-task-005-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-005-etapa-004-planejamento.md`](prompt-task-005-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-005-etapa-005-implementacao.md`](prompt-task-005-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-005-etapa-006-revisao.md`](prompt-task-005-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-005-etapa-007-testes-manuais.md`](prompt-task-005-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-005-etapa-008-conclusao.md`](prompt-task-005-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 abrir catálogo e categorias com catálogo vazio e populado; M-002 pesquisar termo existente e inexistente; M-003 combinar filtros de categoria/tamanho/cor/preço; M-004 abrir detalhe e comparar variações disponíveis/indisponíveis; M-005 validar operações administrativas de cadastro/edição/exclusão dentro das permissões; M-006 verificar interface em celular/tablet/computador conforme critérios aprovados.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Módulos de catálogo e interface identificados na análise do código; persistência de produto/variação; documentação de RF-003, RF-004 e RF-012..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-003 DONE, TASK-002 DONE e modelo de produto/variação aprovado.
- Não implementar desconto promocional nem checkout nesta TASK. Testes manuais e eventual script WSL usam apenas ferramentas verificadas no projeto.
