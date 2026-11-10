# TASK-002 — Definir arquitetura executável, ambiente e modelo de dados

## Identificação e prontidão

- **Objetivo:** Derivar desenho arquitetural e modelo lógico executáveis, alinhados com a stack aprovada e os requisitos vigentes.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-001
- **Rastreabilidade:** RF-001–RF-017, RNF-001–RNF-010, ADR-001
- **Bloqueios:** TASK-001 DONE, stack confirmada e decisões de domínio necessárias ao desenho; dados/atributos ou decisões pendentes não podem ser inventados.
- **Scope Guard / Primary Changes:** Documentação de arquitetura, diagramas e ADRs necessários ao modelo lógico, fronteiras, persistência e contratos.
- **Allowed Changes:** Documentação arquitetural e diagramas; não criar código, migrations ou APIs implementadas.
- **Forbidden Changes:** Alterar requisito sem decisão; fixar valores de PDs sem aprovação; introduzir serviços separados/dependências ou tecnologias não aprovadas.
- **Critérios de aceite:** Modelo suporta identidade, endereços, catálogo/variações, estoque/retenção, carrinho, pedido, pagamento simulado, promoções, avaliações e pós-venda; limites transacionais, autorização e decisões pendentes estão claros; ADRs explicam alternativas/efeitos; rastreabilidade e diagramas coerentes.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-002-etapa-001-recontextualizacao.md`](prompt-task-002-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-002-etapa-002-contexto-historico.md`](prompt-task-002-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-002-etapa-003-validacao-pre-condicoes.md`](prompt-task-002-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-002-etapa-004-planejamento.md`](prompt-task-002-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-002-etapa-005-implementacao.md`](prompt-task-002-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-002-etapa-006-revisao.md`](prompt-task-002-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-002-etapa-007-testes-manuais.md`](prompt-task-002-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-002-etapa-008-conclusao.md`](prompt-task-002-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 mapear RF/RN para entidade/fluxo/contrato; M-002 percorrer cenários concorrentes de retenção e idempotência apenas no modelo; M-003 conferir consistência das relações, estados e diagramas; M-004 validar ausência de tecnologia não aprovada.
- A etapa 007 valida manualmente documentos/decisões; não há teste de software nem script WSL aplicável a esta TASK.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: README.md; TASKS.md; AGENTS.md; docs/adr/; docs/architecture/; docs/diagrams/; arquitetura aprovada de TASK-001.
- Lacunas/bloqueios não resolvidos nesta geração: TASK-001 DONE, stack confirmada e decisões de domínio necessárias ao desenho; dados/atributos ou decisões pendentes não podem ser inventados.
- Tarefa de desenho documental. Testes manuais são revisão de modelo/diagramas, não testes de software.
