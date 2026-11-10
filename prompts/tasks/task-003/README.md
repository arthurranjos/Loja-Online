# TASK-003 — Preparar estrutura, execução local e persistência inicial

## Identificação e prontidão

- **Objetivo:** Criar esqueleto mínimo executável e configuração de persistência inicial conforme decisões aprovadas.
- **Estado inicial:** `BLOCKED` (copiado do backlog; revalidar antes de executar qualquer prompt).
- **Dependências:** TASK-002
- **Rastreabilidade:** RNF-007
- **Bloqueios:** TASK-002 DONE; stack, ferramentas e ambiente local documentados e disponíveis.
- **Scope Guard / Primary Changes:** Estrutura mínima do projeto, execução local e persistência base alinhadas à arquitetura aprovada.
- **Allowed Changes:** Somente arquivos necessários ao esqueleto aprovado e instruções de execução/configuração local.
- **Forbidden Changes:** Funcionalidades de negócio, infraestrutura não aprovada, segredos reais, dependências sem justificativa/ADR.
- **Critérios de aceite:** Projeto inicia pela instrução documentada; conexão/configuração de persistência é reproduzível; dados demonstrativos separados de produção; nenhuma funcionalidade de produto foi introduzida.
- **Definition of Done:** critérios da TASK em `TASKS.md`, validações e manual QA aprovado com evidências, documentação e rastreabilidade atualizadas e diff dentro do escopo.

## Sequência de execução

Execute os prompts em ordem, um por vez. Cada um depende de aprovação verificável do gate anterior; não pule etapas nem rode a próxima automaticamente. A geração deste workflow não muda o estado da TASK nem concede autorização de execução. Para implementação, exija TASK `READY`, predecessoras `DONE` e autorização humana explícita.

| Ordem | Etapa | Arquivo | GATE | Dependência |
|---:|---|---|---|---|
| 001 | Recontextualização e prontidão | [`prompt-task-003-etapa-001-recontextualizacao.md`](prompt-task-003-etapa-001-recontextualizacao.md) | GATE-001 | — |
| 002 | Contexto e histórico | [`prompt-task-003-etapa-002-contexto-historico.md`](prompt-task-003-etapa-002-contexto-historico.md) | GATE-002 | GATE-001 aprovado |
| 003 | Validação de pré-condições | [`prompt-task-003-etapa-003-validacao-pre-condicoes.md`](prompt-task-003-etapa-003-validacao-pre-condicoes.md) | GATE-003 | GATE-002 aprovado |
| 004 | Planejamento da etapa | [`prompt-task-003-etapa-004-planejamento.md`](prompt-task-003-etapa-004-planejamento.md) | GATE-004 | GATE-003 aprovado |
| 005 | Implementação controlada | [`prompt-task-003-etapa-005-implementacao.md`](prompt-task-003-etapa-005-implementacao.md) | GATE-005 | GATE-004 aprovado |
| 006 | Revisão e gate técnico | [`prompt-task-003-etapa-006-revisao.md`](prompt-task-003-etapa-006-revisao.md) | GATE-006 | GATE-005 aprovado |
| 007 | Testes manuais | [`prompt-task-003-etapa-007-testes-manuais.md`](prompt-task-003-etapa-007-testes-manuais.md) | GATE-007 | GATE-006 aprovado |
| 008 | Conclusão e validação final | [`prompt-task-003-etapa-008-conclusao.md`](prompt-task-003-etapa-008-conclusao.md) | GATE-008 | GATE-007 aprovado |

## Gates e conclusão

- Gates totais: 8; gate 001 é prontidão/contexto; 002 histórico; 003 pré-condições; 004 planejamento; 005 execução autorizada; 006 revisão; 007 QA manual; 008 validação final.
- A etapa manual é obrigatória. Casos: M-001 preparar ambiente Windows/WSL conforme documentação e registrar pré-requisitos; M-002 iniciar a aplicação localmente e observar saída/health indicator previsto; M-003 conectar ao armazenamento local e confirmar operação mínima aprovada sem dados reais; M-004 repetir inicialização limpa conforme instruções.
- Não há execução de testes manuais nesta geração. O prompt da etapa 007 prepara instruções/scripts Windows/WSL apenas com stack confirmada e exige registro de resultado obtido/evidência pelo responsável.
- Falha: diagnosticar, corrigir apenas dentro do escopo e reexecutar a verificação; fora do escopo, registrar SCOPE ESCALATION e bloquear.
- Critério para TASK concluída: todos os gates aprovados com evidência, critérios/DoD atendidos, revisões e testes manuais obrigatórios aprovados, backlog atualizado e relatório final. Depois parar.

## Contexto e lacunas

- Arquivos a inspecionar: Arquivos de scaffold e configuração definidos em TASK-002; README e documentação operacional relacionados..
- Lacunas/bloqueios não resolvidos nesta geração: TASK-002 DONE; stack, ferramentas e ambiente local documentados e disponíveis.
- Comandos e script WSL só podem usar a stack efetivamente confirmada; não presuma comandos npm/Maven/Gradle/Python/Docker. Roteiro e scripts de teste são preparados para execução manual pelo responsável.
