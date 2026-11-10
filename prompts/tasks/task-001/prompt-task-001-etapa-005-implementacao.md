# TASK-001 — ETAPA 005 — Implementação controlada

> Este arquivo é um prompt operacional da TASK-001; sua geração não autoriza nem significa executar a TASK. Siga AGENTS.md e o estado do backlog. Não execute a próxima etapa automaticamente.

## 1. OBJETIVO

Execute somente o trabalho autorizado da TASK dentro de Primary Changes/Allowed Changes; pare perante ambiguidade ou escopo extra. Esta etapa tem um único resultado verificável: gate GATE-005.

## 2. CONTEXTO

- TASK: TASK-001 — Confirmar restrições acadêmicas e decidir stack.
- Estado inicial registrado: BLOCKED; revalide `TASKS.md` no momento de usar este prompt.
- Objetivo funcional: Registrar as restrições acadêmicas confirmadas e, com base nelas, resolver stack e forma de entrega sem inferir requisitos.
- Rastreabilidade: PD-001.
- Bloqueio/decisão específica: Orientação oficial da faculdade/professor (PD-001); atualmente indisponível no repositório.
- Contexto documental atual: repositório inicialmente contém README.md, AGENTS.md, TASKS.md e docs de arquitetura/ADR/diagramas; histórico observado na geração: branch `main`, um commit de planejamento, nenhum código-fonte listado. Reconfirme fatos atuais antes de agir.
- Tarefa documental/de decisão. A etapa de validação manual verifica evidências e consistência documental; não há teste de software. Se a orientação ainda não existir, manter TASK bloqueada em PD-001 e gerar SCOPE ESCALATION/solicitação de decisão, sem escolher stack.

## 3. PRÉ-CONDIÇÕES

- Leia nesta ordem: AGENTS.md, README.md, TASKS.md e ADR/documentos diretamente relacionados.
- Valide GATE-004 como APROVADO com evidência registrada. Se faltar relatório/evidência ou o gate anterior não estiver aprovado, marque a etapa atual BLOQUEADA e não avance.
- Confirme autorização humana explícita para executar a TASK antes de alterações; o pedido para gerar prompts não é autorização para executar TASKs.
- Working tree/branch/histórico devem ser inspecionados; preserve trabalho preexistente.
- Para alteração de código, a TASK precisa estar READY, predecessoras DONE, Definition of Ready satisfeita, ambiente e stack confirmados.

## 4. ENTRADAS NECESSÁRIAS

- TASKS.md e critérios/Scope Guard atuais.
- Requisitos e regras rastreados: PD-001.
- Dependências: nenhuma (validar se a TASK continua bloqueada por decisões).
- Decisões/pendências necessárias: Orientação oficial da faculdade/professor (PD-001); atualmente indisponível no repositório.
- Evidências da etapa anterior e status acumulado dos gates.
- Ambiente/comandos documentados no projeto; nenhuma stack ou comando pode ser presumido.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

- Escopo primário previsto: Documentação aprovada de requisitos, arquitetura, ADRs e backlog estritamente necessária para incorporar a orientação recebida.
- Allowed Changes: Documentação de planejamento; nunca código, migrations ou infraestrutura.
- Arquivos a inspecionar primeiro: Orientação acadêmica fornecida pelo usuário/professor; README.md; TASKS.md; AGENTS.md; docs/adr/; docs/architecture/; docs/diagrams/
- Identifique caminhos reais no repositório antes de propor alteração. Não invente nomes de source file/API/componente.
- Arquivos fora do escopo/Forbidden Changes: Escolher tecnologia sem evidência; alterar requisito de negócio; implementar software; apagar histórico de decisão.

## 6. PROCEDIMENTO DETALHADO

1. Implemente o objetivo estrito: Registrar as restrições acadêmicas confirmadas e, com base nelas, resolver stack e forma de entrega sem inferir requisitos.
2. Limite Primary Changes a: Documentação aprovada de requisitos, arquitetura, ADRs e backlog estritamente necessária para incorporar a orientação recebida. Allowed Changes: Documentação de planejamento; nunca código, migrations ou infraestrutura.
3. Satisfaça os critérios: A fonte acadêmica está identificada; requisitos técnicos e formato/prazo conhecidos ou explicitamente mantidos pendentes; escolhas propostas são compatíveis e justificadas; PD-001 atualizada; dependências e rastreabilidade consistentes.
4. Preserve arquitetura em camadas, autorização, isolamento dos dados, validação no servidor, segurança e invariantes pertinentes do README/ADR.
5. Faça somente alterações mínimas aprovadas. Mudança incidental exige necessidade, justificativa, evidência e registro; não inclua dependência sem ADR/aprovação.
6. Execute apenas validações autorizadas pela TASK/projeto, registando comandos/códigos de saída. Não modifique critérios para fazer o gate passar.
7. Atualize documentação/rastreabilidade e TASKS somente quando a mudança aprovada exigir e preserve IDs imutáveis.

## 7. RESTRIÇÕES

- Não implemente além do escopo específico desta TASK e etapa.
- Não altere regras de negócio, requisitos, contratos públicos, arquitetura ou decisões pendentes silenciosamente.
- Não adicione dependências sem justificativa necessária e ADR/aprovação exigida.
- Não remova testes nem desative validações para contornar falhas.
- Preserve autorização cliente/admin, isolamento de dados, hashes de senha, logs sem segredos e invariantes de estoque/pagamento/pedido conforme aplicável.
- Não faça commit automaticamente nem reescreva histórico.
- Para esta TASK, Forbidden Changes: Escolher tecnologia sem evidência; alterar requisito de negócio; implementar software; apagar histórico de decisão.

## 8. VALIDAÇÕES

- Validação específica desta etapa: Etapa de análise/planejamento: não executar teste de software. Se usar comando de inspeção, registrar comando, código de saída e resultado. O gate é evidência documental desta etapa.
- Critérios de aceitação da TASK: A fonte acadêmica está identificada; requisitos técnicos e formato/prazo conhecidos ou explicitamente mantidos pendentes; escolhas propostas são compatíveis e justificadas; PD-001 atualizada; dependências e rastreabilidade consistentes.
- Registre cada verificação como OK, FALHA ou NÃO APLICÁVEL, com evidência (arquivo/linha, comando/código de saída, captura/registro manual ou cálculo reproduzível).
- Gate manual de QA exige execução humana e resultado preenchido; testes automatizados não o substituem.
- Se validação não for possível por ambiente ou decisão ausente, BLOQUEADO; não invente resultado.

## 9. TRATAMENTO DE FALHAS

1. Interrompa o avanço e registre etapa, comando/operação, código de saída e mensagem literal do erro (removendo segredos/dados pessoais).
2. Identifique causa provável e evidência; determine se pertence ao escopo permitido desta TASK.
3. Proponha a menor correção. Execute apenas quando está autorizada pelo Allowed Changes e não altera decisão de negócio/arquitetura.
4. Reexecute a validação que falhou e registre o novo resultado; gate só muda com evidência nova.
5. Se fora do escopo, produza SCOPE ESCALATION no formato da seção 10 e mantenha STATUS BLOQUEADO/AGUARDANDO DECISÃO.
6. Nunca omita falha, invente resultado, marque teste não executado como aprovado ou avance apesar de gate anterior bloqueado.

## 10. SCOPE ESCALATION

Quando correção necessária não estiver em Allowed Changes, exigir alteração de requisito/regra/API/arquitetura, exigir tecnologia não confirmada ou resolver pendência humana, não editar. Registrar exatamente:

SCOPE ESCALATION
Problema identificado: <fato e evidência>
Impacto: <requisitos, segurança, dados, cronograma>
Por que está fora do escopo: <regra da TASK/AGENTS>
Alteração necessária: <mudança mínima>
Arquivos potencialmente afetados: <caminhos observados ou 'a identificar'>
Riscos: <concretos>
Alternativas: <opções, sem decidir pelo usuário>
Recomendação: <opção e justificativa>
DECISÃO NECESSÁRIA: <pergunta objetiva>

Mantenha esta etapa BLOQUEADA e não execute a seguinte.

## 11. CRITÉRIOS DE APROVAÇÃO

- Todas as pré-condições relevantes desta etapa têm evidência.
- Todos os critérios aplicáveis a esta etapa foram verificados; falhas corrigidas dentro do escopo foram revalidadas.
- Nenhuma pendência bloqueadora, alteração não relacionada ou violação de Forbidden Changes permanece.
- Gate anterior foi aprovado por evidência; o status acumulado é contado, não presumido.
- O resultado da etapa e arquivos/evidências ficam registrados de modo reproduzível.
- Para a TASK: A fonte acadêmica está identificada; requisitos técnicos e formato/prazo conhecidos ou explicitamente mantidos pendentes; escolhas propostas são compatíveis e justificadas; PD-001 atualizada; dependências e rastreabilidade consistentes.

## 12. GATE DA ETAPA

**GATE-005 — Implementação controlada**

- [ ] Pré-condições desta etapa atendidas.
- [ ] Procedimento concluído dentro do Scope Guard.
- [ ] Validações/evidências registradas e revisáveis.
- [ ] Falhas corrigidas e revalidadas ou escalonadas sem avançar.
- [ ] Gate anterior aprovado (exceto etapa 001).
- [ ] Sem bloqueio de decisão, segurança ou dependência.

Declare `STATUS: APROVADO` somente com todos os itens aplicáveis verificados. Caso contrário, `REPROVADO` para critério avaliado e não atendido ou `BLOQUEADO` para pré-condição/decisão/ambiente faltante. `PRÓXIMA ETAPA: HABILITADA` apenas se APROVADO.

## 13. STATUS ACUMULADO DOS GATES

Apresente sempre todos os gates da TASK e atualize somente com relatório/evidência verificável:

GATE-001 — Recontextualização e prontidão: aguarda relatório/evidência; não presumir status
GATE-002 — Contexto e histórico: aguarda relatório/evidência; não presumir status
GATE-003 — Validação de pré-condições: aguarda relatório/evidência; não presumir status
GATE-004 — Planejamento da etapa: aguarda relatório/evidência; não presumir status
GATE-005 — Implementação controlada: PENDENTE (aguarda execução desta etapa)
GATE-006 — Revisão e gate técnico: aguarda relatório/evidência; não presumir status
GATE-007 — Testes manuais: aguarda relatório/evidência; não presumir status
GATE-008 — Conclusão e validação final: aguarda relatório/evidência; não presumir status

Calcule `GATES CONCLUÍDOS: X/8` e `GATES PENDENTES: X/8`; discrimine também bloqueados. Não contar etapa executada como concluída se seu gate falhou. Se não houver estado anterior confiável, marcar desconhecido/bloqueado e reconciliar antes de prosseguir.

## 14. RESULTADO OBRIGATÓRIO

Finalize a resposta exatamente com o relatório abaixo preenchido. Não execute a próxima etapa na mesma resposta, mesmo se habilitada.

```text
==================================================
TASK: TASK-001
ETAPA: 005
STATUS DA ETAPA: APROVADA | REPROVADA | BLOQUEADA
==================================================

GATE DA ETAPA:
[APROVADO | REPROVADO | BLOQUEADO]

GATES TOTAIS: 8
GATES CONCLUÍDOS: <contagem baseada em evidência>
GATES PENDENTES: <contagem baseada em evidência>
GATES BLOQUEADOS: <contagem baseada em evidência>

PROBLEMAS ENCONTRADOS:
- <itens ou Nenhum observado>

CORREÇÕES REALIZADAS:
- <itens com arquivos/evidências ou Nenhuma>

PENDÊNCIAS:
- <itens ou Nenhuma>

TESTES RELACIONADOS:
- <executados, aprovados, reprovados, bloqueados e pendentes; nunca presumir>

PRÓXIMA ETAPA:
<número/nome ou Nenhuma>

PRÓXIMA ETAPA HABILITADA:
SIM | NÃO

MOTIVO:
<evidência objetiva do gate e da regra de continuidade>
==================================================
```
