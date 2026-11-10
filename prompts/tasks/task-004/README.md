# TASK-004 — Implementar autenticação, confirmação e recuperação

## Identificação e prontidão

- **Objetivo:** Implementar cadastro, login, confirmação de e-mail, recuperação de senha, perfil e endereços do cliente.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-002
- **Rastreabilidade:** RF-001, RF-002; RN-002; RNF-002, RNF-003
- **Bloqueios:** TASK-002 DONE, stack e PD-008 resolvidas (canal acadêmico para confirmação/recuperação), ambiente e autorização explícita.
- **Scope Guard / Primary Changes:** Módulos de identidade, perfil, confirmação/recuperação e múltiplos endereços.
- **Allowed Changes:** Código, persistência e validações diretamente necessários aos fluxos aprovados.
- **Forbidden Changes:** Login social, envio externo não aprovado, permissões administrativas adicionais, vazamento de existência de conta, segredos em código/log.
- **Critérios de aceite:** Cadastro captura nome/e-mail/senha/dados básicos; e-mail não confirmado não compra; senha protegida; recuperação não revela se e-mail existe; cliente edita perfil e mantém múltiplos endereços; autorização isola dados.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-004-etapa-001-recontextualizacao.md`](prompt-task-004-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-004-etapa-002-contexto-historico.md`](prompt-task-004-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-004-etapa-003-validacao-pre-condicoes.md`](prompt-task-004-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-004-etapa-004-planejamento.md`](prompt-task-004-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-004-etapa-005-implementacao.md`](prompt-task-004-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-004-etapa-006-revisao.md`](prompt-task-004-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-004-etapa-007-testes-manuais.md`](prompt-task-004-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-004-etapa-008-conclusao.md`](prompt-task-004-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 cadastro válido e confirmação; M-002 login antes/depois de confirmar e-mail; M-003 senha inválida, recuperação e resposta que não enumera conta; M-004 editar perfil e salvar dois endereços; M-005 cliente tenta acessar dados de outro cliente e recebe negação; M-006 confirmar ausência de segredos em logs/URLs.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Módulos de identidade/perfil e persistência identificados na etapa de planejamento; configuração aprovada do canal PD-008; documentação associada..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-002 DONE, stack e PD-008 resolvidas (canal acadêmico para confirmação/recuperação), ambiente e autorização explícita.
- Não criar provedores reais ou e-mail transacional externo sem decisão. Os testes manuais devem ser executáveis no ambiente Windows/WSL documentado e registrar evidência sem senha/token.
