# TASK-006 — Implementar carrinho e cálculo de frete

## Identificação e prontidão

- **Objetivo:** Implementar carrinho autenticado e total incluindo cálculo de frete por CEP segundo regra aprovada.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-004, TASK-005
- **Rastreabilidade:** RF-005–RF-007; RN-007
- **Bloqueios:** TASK-004 e TASK-005 DONE; PD-003 resolvida com fórmula/regiões/valores por CEP; stack/ambiente prontos.
- **Scope Guard / Primary Changes:** Carrinho, validação de quantidades, resumo de compra e cálculo determinístico de frete.
- **Allowed Changes:** Carrinho, interface/serviço de frete e uso de endereços apenas conforme regra aprovada.
- **Forbidden Changes:** Inventar valores/fórmula regional, reservar estoque, processar pagamento, ampliar dados de endereço sem necessidade.
- **Critérios de aceite:** Cliente adiciona/altera/remove itens e consulta total; checkout usa endereço brasileiro e CEP; frete reproduz a fórmula aprovada e total é coerente.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-006-etapa-001-recontextualizacao.md`](prompt-task-006-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-006-etapa-002-contexto-historico.md`](prompt-task-006-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-006-etapa-003-validacao-pre-condicoes.md`](prompt-task-006-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-006-etapa-004-planejamento.md`](prompt-task-006-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-006-etapa-005-implementacao.md`](prompt-task-006-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-006-etapa-006-revisao.md`](prompt-task-006-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-006-etapa-007-testes-manuais.md`](prompt-task-006-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-006-etapa-008-conclusao.md`](prompt-task-006-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 adicionar/remover/altera quantidade; M-002 carrinho vazio; M-003 CEP válido/inválido; M-004 comparar regiões conforme tabela aprovada e confirmar monotonicidade relativa ao Sudeste; M-005 conferir subtotal, frete, arredondamento e total; M-006 usuário não autorizado não acessa carrinho de outra conta.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Módulos de carrinho e frete identificados no planejamento; endereço do cliente; regra/tabela de PD-003 aprovada..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-004 e TASK-005 DONE; PD-003 resolvida com fórmula/regiões/valores por CEP; stack/ambiente prontos.
- PD-003 não está resolvida no backlog atual. Sem a decisão, gate de pré-condições bloqueia implementação; não fabricar valores de demonstração como se fossem aprovados.
