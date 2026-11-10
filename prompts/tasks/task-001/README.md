# TASK-001 — Confirmar restrições acadêmicas e decidir stack

## Identificação e prontidão

- **Objetivo:** Registrar as restrições acadêmicas confirmadas e, com base nelas, resolver stack e forma de entrega sem inferir requisitos.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** nenhuma (validar se a TASK continua bloqueada por decisões)
- **Rastreabilidade:** PD-001
- **Bloqueios:** Orientação oficial da faculdade/professor (PD-001); atualmente indisponível no repositório.
- **Scope Guard / Primary Changes:** Documentação aprovada de requisitos, arquitetura, ADRs e backlog estritamente necessária para incorporar a orientação recebida.
- **Allowed Changes:** Documentação de planejamento; nunca código, migrations ou infraestrutura.
- **Forbidden Changes:** Escolher tecnologia sem evidência; alterar requisito de negócio; implementar software; apagar histórico de decisão.
- **Critérios de aceite:** A fonte acadêmica está identificada; requisitos técnicos e formato/prazo conhecidos ou explicitamente mantidos pendentes; escolhas propostas são compatíveis e justificadas; PD-001 atualizada; dependências e rastreabilidade consistentes.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-001-etapa-001-recontextualizacao.md`](prompt-task-001-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-001-etapa-002-contexto-historico.md`](prompt-task-001-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-001-etapa-003-validacao-pre-condicoes.md`](prompt-task-001-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-001-etapa-004-planejamento.md`](prompt-task-001-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-001-etapa-005-implementacao.md`](prompt-task-001-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-001-etapa-006-revisao.md`](prompt-task-001-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-001-etapa-007-testes-manuais.md`](prompt-task-001-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-001-etapa-008-conclusao.md`](prompt-task-001-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 conferir cada decisão com a orientação acadêmica citada; M-002 conferir que nenhuma decisão sem evidência foi registrada como fato; M-003 validar links, IDs e coerência da matriz de rastreabilidade documental.
- A etapa 007 valida manualmente documentos/decisões; não há teste de software nem script WSL aplicável a esta TASK.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Orientação acadêmica fornecida pelo usuário/professor; README.md; TASKS.md; AGENTS.md; docs/adr/; docs/architecture/; docs/diagrams/.
- Lacunas/bloqueios não resolvidos nesta geração: Orientação oficial da faculdade/professor (PD-001); atualmente indisponível no repositório.
- Tarefa documental/de decisão. A etapa de validação manual verifica evidências e consistência documental; não há teste de software. Se a orientação ainda não existir, manter TASK bloqueada em PD-001 e gerar SCOPE ESCALATION/solicitação de decisão, sem escolher stack.
