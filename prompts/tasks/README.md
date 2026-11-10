# Índice global — Prompts operacionais das TASKs

## Escopo e regras

Este diretório contém workflows de prompts para as 15 TASKs registradas em `../../TASKS.md`. A criação dos prompts não executa as TASKs nem muda seus estados. No momento da geração, todas estavam `BLOCKED`; confirme o estado atual antes de qualquer execução. Siga o `../../AGENTS.md`, critérios, dependências e Scope Guard do backlog.

Cada workflow tem oito etapas numeradas e GATE próprio: prontidão, contexto/histórico, pré-condições, planejamento, execução autorizada, revisão, testes manuais e conclusão. É obrigatório avançar uma etapa de cada vez, com evidência. Etapa de implementação só pode ser usada após TASK `READY`, dependências `DONE`, DoR atendida e autorização humana explícita. Teste manual Windows/WSL é executado e evidenciado pelo responsável; automação não substitui o gate manual. A stack ainda é pendência PD-001 e os prompts proíbem inventar comandos/tecnologias.

TASK-001 e TASK-002 são tarefas documentais: o gate manual delas verifica decisões/modelos/documentos e não exige script WSL nem teste de software. Nas demais tarefas, preparar roteiro e eventual script WSL só depois de confirmar a tecnologia e validar que o escopo permite.

## TASKs

| TASK | Descrição | Etapas | Dependências | Pasta | Primeiro prompt | Estado no backlog |
|---|---|---:|---|---|---|---|
| TASK-001 | Confirmar restrições acadêmicas e decidir stack | 8 | nenhuma (validar se a TASK continua bloqueada por decisões) | [`task-001/`](task-001/) | [`task-001/prompt-task-001-etapa-001-recontextualizacao.md`](task-001/prompt-task-001-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-002 | Definir arquitetura executável, ambiente e modelo de dados | 8 | TASK-001 | [`task-002/`](task-002/) | [`task-002/prompt-task-002-etapa-001-recontextualizacao.md`](task-002/prompt-task-002-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-003 | Preparar estrutura, execução local e persistência inicial | 8 | TASK-002 | [`task-003/`](task-003/) | [`task-003/prompt-task-003-etapa-001-recontextualizacao.md`](task-003/prompt-task-003-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-004 | Implementar autenticação, confirmação e recuperação | 8 | TASK-002 | [`task-004/`](task-004/) | [`task-004/prompt-task-004-etapa-001-recontextualizacao.md`](task-004/prompt-task-004-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-005 | Implementar catálogo, busca, filtros e variações | 8 | TASK-003 | [`task-005/`](task-005/) | [`task-005/prompt-task-005-etapa-001-recontextualizacao.md`](task-005/prompt-task-005-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-006 | Implementar carrinho e cálculo de frete | 8 | TASK-004, TASK-005 | [`task-006/`](task-006/) | [`task-006/prompt-task-006-etapa-001-recontextualizacao.md`](task-006/prompt-task-006-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-007 | Implementar retenção concorrente e expiração de estoque | 8 | TASK-006 | [`task-007/`](task-007/) | [`task-007/prompt-task-007-etapa-001-recontextualizacao.md`](task-007/prompt-task-007-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-008 | Implementar pagamento simulado e criação consistente de pedido | 8 | TASK-007 | [`task-008/`](task-008/) | [`task-008/prompt-task-008-etapa-001-recontextualizacao.md`](task-008/prompt-task-008-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-009 | Implementar conta do cliente e fluxo de pedidos | 8 | TASK-008 | [`task-009/`](task-009/) | [`task-009/prompt-task-009-etapa-001-recontextualizacao.md`](task-009/prompt-task-009-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-010 | Implementar painel e operações administrativas | 8 | TASK-004, TASK-005, TASK-008 | [`task-010/`](task-010/) | [`task-010/prompt-task-010-etapa-001-recontextualizacao.md`](task-010/prompt-task-010-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-011 | Implementar solicitações pós-venda | 8 | TASK-009, TASK-010 | [`task-011/`](task-011/) | [`task-011/prompt-task-011-etapa-001-recontextualizacao.md`](task-011/prompt-task-011-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-012 | Implementar promoções de produto | 8 | TASK-010 | [`task-012/`](task-012/) | [`task-012/prompt-task-012-etapa-001-recontextualizacao.md`](task-012/prompt-task-012-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-013 | Implementar avaliações verificadas e moderação | 8 | TASK-009, TASK-010 | [`task-013/`](task-013/) | [`task-013/prompt-task-013-etapa-001-recontextualizacao.md`](task-013/prompt-task-013-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-014 | Implementar relatório de vendas | 8 | TASK-010 | [`task-014/`](task-014/) | [`task-014/prompt-task-014-etapa-001-recontextualizacao.md`](task-014/prompt-task-014-etapa-001-recontextualizacao.md) | BLOCKED |
| TASK-015 | Revisar segurança, responsividade, auditoria e operação | 8 | TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 | [`task-015/`](task-015/) | [`task-015/prompt-task-015-etapa-001-recontextualizacao.md`](task-015/prompt-task-015-etapa-001-recontextualizacao.md) | BLOCKED |

## Regras de continuidade

- Status/estados desta tabela refletem a fotografia do backlog durante a geração e não atualizam `TASKS.md`.
- Se gate falhar, interromper, registrar operação/erro/evidência, diagnosticar, corrigir somente dentro do escopo e reexecutar validação. Não avançar antes de nova aprovação.
- Decisões pendentes, ambiente não disponível, dependência incompleta ou risco fora de escopo bloqueiam o gate e exigem `SCOPE ESCALATION`.
- Relatórios de etapa devem manter estado acumulado de gates e evidências; nunca afirmar testes executados sem execução observada.
- Nenhum prompt desta coleção autoriza commit automático, alteração de requisitos ou execução de TASK dependente.

## Inventário da geração

- TASKs identificadas/processadas: 15.
- Prompts de etapa: 120 (oito por TASK).
- READMEs de TASK: 15.
- README global: 1.
- Total de arquivos Markdown gerados: 136.
- Implementações executadas: nenhuma.
- Testes manuais executados: nenhum; foram definidos roteiros por TASK.
