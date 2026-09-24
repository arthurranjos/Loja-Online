# Contrato de trabalho para agentes de codificação

## Ordem de leitura

1. `AGENTS.md` (este contrato).
2. `README.md` (requisitos, decisões, pendências e rastreabilidade).
3. `TASKS.md` (tarefa autorizada, estado, dependências e Scope Guard).
4. ADRs e documentos de arquitetura referenciados pela tarefa.
5. Instruções locais mais específicas no diretório afetado, se existirem; conflitos devem ser reportados.

## Seleção de tarefa

- Não implemente durante elicitação ou planejamento.
- Para implementação, selecione somente uma TASK com estado `READY` e autorização explícita do usuário para implementá-la.
- Confirme todos os `Depends on` como `DONE` e valide a Definition of Ready.
- Não altere estado de tarefa sem atualizar `TASKS.md`; registre `IN_PROGRESS` ao iniciar, `IN_REVIEW` após concluir mudanças e validações, e `DONE` somente após revisão dos gates.
- Se a tarefa ficar bloqueada, registre motivo e dependência; não avance para outra TASK sem autorização.

## Scope Guard

Antes de editar, liste mentalmente (ou no resumo de progresso) Primary Changes, Allowed Changes, Incidental Changes Policy e Forbidden Changes da TASK.

- Faça a menor mudança que satisfaça a tarefa.
- Mudança incidental só é permitida se indispensável para compilar, executar ou validar a tarefa, tiver justificativa e for registrada.
- Se requisito, regra de negócio, API pública, arquitetura aprovada ou arquivo proibido precisar mudar, pare antes dessa mudança e solicite decisão com impacto concreto.
- Não converta pendências em valores padrão inventados.
- Não inclua dependência/serviço externo sem justificativa e aprovação arquitetural documentada em ADR.
- Não esconda expansão de escopo sob refatoração ou correção incidental.

## Qualidade e segurança

- Preserve autorização entre cliente e administrador e isolamento dos dados de clientes.
- Nunca grave senhas, tokens, segredos ou dados sensíveis em logs, fixtures públicas ou repositório.
- Preserve atomicidade e invariantes de estoque, pagamento e pedido.
- Valide entradas no servidor; erros não devem revelar dados de outros usuários ou detalhes internos.
- Não desative validações nem remova testes para fazer uma tarefa passar.
- Execute apenas os gates definidos pela TASK e pelo projeto. Registre comandos e resultados verdadeiros; não declare testes executados sem executá-los.
- Considere responsividade e acessibilidade nos fluxos de interface alterados.

## Branches e commits

- Use branch `codex/<id-da-task>-<descricao-curta>` quando o fluxo Git estiver autorizado e disponível.
- Não faça commit automaticamente. Só crie commit se a TASK ou pedido explícito solicitar; use mensagem que inclua o ID da TASK.
- Não reescreva histórico, descarte mudanças preexistentes ou altere branches remotas sem instrução explícita.

## Atualização de documentação e backlog

- Atualize README, ADRs, diagramas e rastreabilidade quando uma decisão aprovada mudar o contrato.
- Preserve imutavelmente IDs RF/RN/RNF/UC/TASK/ADR/PD. Itens removidos recebem estado `DEPRECATED` ou `CANCELLED`; IDs não são reutilizados.
- Atualize dependências e estados da TASK afetada; mantenha o grafo sem ciclos.
- Decisão arquitetural significativa exige ADR com contexto, alternativas, decisão e consequências.

## Regra de parada e escalonamento

Pare antes de uma mudança se encontrar ambiguidade que altera comportamento de negócio, segurança, API pública, dependência, custo ou arquitetura; se uma dependência estiver incompleta; se a validação necessária não estiver disponível; ou se a alteração exigida violar Forbidden Changes. Informe o bloqueio, evidência, opções e decisão necessária. Continue apenas trabalho independente dentro do escopo autorizado.

## Relatório ao concluir

Informe TASK, arquivos alterados, comportamento entregue, decisões ou pendências encontradas, validações realmente executadas e resultados. Marque `DONE` apenas quando os critérios e gates forem comprovados. Depois pare e aguarde a próxima autorização.

