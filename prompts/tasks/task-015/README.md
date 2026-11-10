# TASK-015 — Revisar segurança, responsividade, auditoria e operação

## Identificação e prontidão

- **Objetivo:** Revisar e corrigir lacunas transversais comprovadas de segurança, responsividade, integridade, auditoria, logs e backup/restauração.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014
- **Rastreabilidade:** RNF-001–RNF-010
- **Bloqueios:** TASK-004 a TASK-014 DONE ou removidas formalmente com rastreabilidade; PD-007 resolvida; critérios de dispositivo/implantação acordados.
- **Scope Guard / Primary Changes:** Correções mínimas para lacunas comprovadas em RNF-001–RNF-010 e documentação operacional.
- **Allowed Changes:** Somente correções necessárias com evidência de requisito violado; documentação de backup/restauração aprovada.
- **Forbidden Changes:** Infra/serviço externo novo sem ADR, desativar validações, remover cobertura, reescrever arquitetura sem decisão, mudança transversal sem evidência.
- **Critérios de aceite:** Cada RNF recebe evidência verificável; backup/restauração ensaiados conforme procedimento aprovado; interface verificada nos dispositivos/medidas acordados; logs não expõem segredos; achados resolvidos ou aceitos formalmente como pendentes.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-015-etapa-001-recontextualizacao.md`](prompt-task-015-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-015-etapa-002-contexto-historico.md`](prompt-task-015-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-015-etapa-003-validacao-pre-condicoes.md`](prompt-task-015-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-015-etapa-004-planejamento.md`](prompt-task-015-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-015-etapa-005-implementacao.md`](prompt-task-015-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-015-etapa-006-revisao.md`](prompt-task-015-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-015-etapa-007-testes-manuais.md`](prompt-task-015-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-015-etapa-008-conclusao.md`](prompt-task-015-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 navegar fluxos críticos em celular/tablet/computador nas larguras aprovadas; M-002 cliente tenta acessar operação administrativa e dado de outro cliente; M-003 conferir entrada inválida e erro sem vazamento; M-004 inspecionar logs de fluxo de autenticação, erro e pedido sem segredos; M-005 executar backup e restauração em ambiente não produtivo e reconciliar dados; M-006 verificar concorrência/consistência via cenários do checkout; M-007 confirmar instruções de recuperação e resultado registrado.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Áreas transversais comprovadamente afetadas e documentação operacional; checklist RNF-001–RNF-010; PD-007..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-004 a TASK-014 DONE ou removidas formalmente com rastreabilidade; PD-007 resolvida; critérios de dispositivo/implantação acordados.
- Não fazer limpeza/reforma geral. Toda correção incidental deve satisfazer o Scope Guard e apontar evidência. Manual QA precisa ser executado por responsável no Windows/WSL; script só se stack existente e útil.
