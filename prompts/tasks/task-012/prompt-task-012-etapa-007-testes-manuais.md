# TASK-012 — ETAPA 007 — Testes manuais

> Este arquivo é um prompt operacional da TASK-012; sua geração não autoriza nem significa executar a TASK. Siga AGENTS.md e o estado do backlog. Não execute a próxima etapa automaticamente.

## 1. OBJETIVO

Prepare/execute o roteiro manual em Windows/WSL conforme autorizado, registre evidências reais e não use testes automatizados como substitutos. Esta etapa tem um único resultado verificável: gate GATE-007.

## 2. CONTEXTO

- TASK: TASK-012 — Implementar promoções de produto.
- Estado inicial registrado: BLOCKED; revalide `TASKS.md` no momento de usar este prompt.
- Objetivo funcional: Administrar descontos de produto com janela de início/término e preço consistente no catálogo/checkout.
- Rastreabilidade: RF-014; RN-008.
- Bloqueio/decisão específica: TASK-010 DONE; PD-005 resolvida; conflitos entre promoções definidos e decisões de preço aprovadas.
- Contexto documental atual: repositório inicialmente contém README.md, AGENTS.md, TASKS.md e docs de arquitetura/ADR/diagramas; histórico observado na geração: branch `main`, um commit de planejamento, nenhum código-fonte listado. Reconfirme fatos atuais antes de agir.
- Acúmulo de descontos está fora do escopo inicial. O backlog marca limite de uso como pendente; manter bloqueado até decisão.

## 3. PRÉ-CONDIÇÕES

- Leia nesta ordem: AGENTS.md, README.md, TASKS.md e ADR/documentos diretamente relacionados.
- Valide GATE-006 como APROVADO com evidência registrada. Se faltar relatório/evidência ou o gate anterior não estiver aprovado, marque a etapa atual BLOQUEADA e não avance.
- Confirme autorização humana explícita para executar a TASK antes de alterações; o pedido para gerar prompts não é autorização para executar TASKs.
- Working tree/branch/histórico devem ser inspecionados; preserve trabalho preexistente.
- Para alteração de código, a TASK precisa estar READY, predecessoras DONE, Definition of Ready satisfeita, ambiente e stack confirmados.

## 4. ENTRADAS NECESSÁRIAS

- TASKS.md e critérios/Scope Guard atuais.
- Requisitos e regras rastreados: RF-014; RN-008.
- Dependências: TASK-010.
- Decisões/pendências necessárias: TASK-010 DONE; PD-005 resolvida; conflitos entre promoções definidos e decisões de preço aprovadas.
- Evidências da etapa anterior e status acumulado dos gates.
- Ambiente/comandos documentados no projeto; nenhuma stack ou comando pode ser presumido.

## 5. ARQUIVOS E COMPONENTES ENVOLVIDOS

- Escopo primário previsto: Regras e interface para promoção de produto e cálculo/apresentação de preço promocional.
- Allowed Changes: Desconto de produto e datas aprovadas; integração de apresentação com catálogo/carrinho.
- Arquivos a inspecionar primeiro: Administração de promoções, catálogo e cálculo de preço identificados no planejamento; PD-005 e regra de conflito aprovada.
- Identifique caminhos reais no repositório antes de propor alteração. Não invente nomes de source file/API/componente.
- Arquivos fora do escopo/Forbidden Changes: Cupons, acúmulo, limite presumido, regras complexas ou preço divergente no pedido.

## 6. PROCEDIMENTO DETALHADO

Roteiro a preparar e preencher manualmente: M-001 antes da data inicial; M-002 dentro da janela; M-003 após data final; M-004 editar produto promovido e conferir consistência; M-005 duas promoções concorrentes seguem a regra aprovada; M-006 conferir subtotal/preço final e não acumulação.

O executor deve criar instruções/scripts apropriados para Windows → WSL → Linux somente se a tecnologia tiver sido confirmada e scripts couberem no Allowed Changes. Não invente comandos. Para cada caso registre objetivo, pré-condições, comandos verificados, procedimento numerado, resultado esperado, resultado obtido, caminho/descrição da evidência e status NÃO EXECUTADO/APROVADO/REPROVADO/BLOQUEADO. O responsável humano deve executar manualmente; o agente não declara aprovado sem resultado observado. Testes automatizados podem ser executados quando a TASK os exigir, mas nunca substituem esse gate.

## 7. RESTRIÇÕES

- Não implemente além do escopo específico desta TASK e etapa.
- Não altere regras de negócio, requisitos, contratos públicos, arquitetura ou decisões pendentes silenciosamente.
- Não adicione dependências sem justificativa necessária e ADR/aprovação exigida.
- Não remova testes nem desative validações para contornar falhas.
- Preserve autorização cliente/admin, isolamento de dados, hashes de senha, logs sem segredos e invariantes de estoque/pagamento/pedido conforme aplicável.
- Não faça commit automaticamente nem reescreva histórico.
- Para esta TASK, Forbidden Changes: Cupons, acúmulo, limite presumido, regras complexas ou preço divergente no pedido.

## 8. VALIDAÇÕES

- Validação específica desta etapa: M-001 antes da data inicial; M-002 dentro da janela; M-003 após data final; M-004 editar produto promovido e conferir consistência; M-005 duas promoções concorrentes seguem a regra aprovada; M-006 conferir subtotal/preço final e não acumulação.
- Critérios de aceitação da TASK: Promoção vale somente no produto e intervalo configurados; fora da janela preço original; conflito/limite tratados conforme decisões aprovadas; pedido registra preço coerente.
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
- Para a TASK: Promoção vale somente no produto e intervalo configurados; fora da janela preço original; conflito/limite tratados conforme decisões aprovadas; pedido registra preço coerente.

## 12. GATE DA ETAPA

**GATE-007 — Testes manuais**

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
GATE-005 — Implementação controlada: aguarda relatório/evidência; não presumir status
GATE-006 — Revisão e gate técnico: aguarda relatório/evidência; não presumir status
GATE-007 — Testes manuais: PENDENTE (aguarda execução desta etapa)
GATE-008 — Conclusão e validação final: aguarda relatório/evidência; não presumir status

Calcule `GATES CONCLUÍDOS: X/8` e `GATES PENDENTES: X/8`; discrimine também bloqueados. Não contar etapa executada como concluída se seu gate falhou. Se não houver estado anterior confiável, marcar desconhecido/bloqueado e reconciliar antes de prosseguir.

## 14. RESULTADO OBRIGATÓRIO

Finalize a resposta exatamente com o relatório abaixo preenchido. Não execute a próxima etapa na mesma resposta, mesmo se habilitada.

```text
==================================================
TASK: TASK-012
ETAPA: 007
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
