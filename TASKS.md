# Backlog de implementação

## Como interpretar

Este backlog governa a execução explicitamente autorizada pelo usuário. O usuário selecionou React + TypeScript + Vite e Supabase/PostgreSQL. As tarefas avançam em sequência, apenas quando `READY` e com dependências `DONE`. IDs são imutáveis.

## Ordem e estado

| ID | Tarefa | Estado | Depends on | Requisitos / rastreio |
|---|---|---|---|---|
| TASK-001 | Confirmar restrições acadêmicas e decidir stack | DONE — escolha do usuário registrada; confirmar exigências adicionais antes de congelar ferramentas/entrega | — | PD-001 |
| TASK-002 | Definir arquitetura executável, ambiente e modelo de dados | DONE — modelo, RLS, ambiente e transações documentados | TASK-001 | RF-001–RF-017, RNF-001–RNF-010, ADR-001, ADR-002 |
| TASK-003 | Preparar estrutura, execução local e persistência inicial | DONE — estrutura, build, lint e conexão local documentados; ver `docs/task-reports/TASK-003.md` | TASK-002 | RNF-007 |
| TASK-004 | Implementar autenticação, confirmação e recuperação | DONE — usuário confirmou os fluxos, inclusive redefinição; ver `docs/task-reports/TASK-004.md` | TASK-002 | RF-001, RF-002; RN-002; RNF-002, RNF-003 |
| TASK-005 | Implementar catálogo, busca, filtros e variações | DONE — usuário confirmou busca, filtros, detalhe e disponibilidade; ver `docs/task-reports/TASK-005.md` | TASK-003 | RF-003, RF-004, RF-012; RN-003 |
| TASK-006 | Implementar carrinho e cálculo de frete | DONE — build/lint passaram, migration aplicada e usuário confirmou fluxo funcionando; relatório em `docs/task-reports/TASK-006.md` | TASK-004, TASK-005 | RF-005–RF-007; RN-007 |
| TASK-007 | Implementar retenção concorrente e expiração de estoque | DONE — migration aplicada; validação concorrente, idempotência, liberação, expiração e saldo físico passaram; ver `docs/task-reports/TASK-007.md` | TASK-006 | RF-008; RN-003–RN-005; RNF-005 |
| TASK-008 | Implementar pagamento simulado e criação consistente de pedido | DONE — migration e roteiro de expiração passaram, build/lint passaram e usuário confirmou os fluxos da interface; ver `docs/task-reports/TASK-008.md` | TASK-007 | RF-006, RF-009, RF-010; RN-004–RN-006 |
| TASK-009 | Implementar conta do cliente e fluxo de pedidos | DONE — usuário confirmou histórico, detalhes e isolamento entre contas; build/lint passaram; ver `docs/task-reports/TASK-009.md` | TASK-008 | RF-002, RF-010 |
| TASK-010 | Implementar painel e operações administrativas | DONE — migration aplicada, bootstrap executado e usuário confirmou painel e operações funcionando; ver `docs/task-reports/TASK-010.md` | TASK-004, TASK-005, TASK-008 | RF-012, RF-013, RF-017; RN-011 |
| TASK-011 | Implementar solicitações pós-venda | DONE — migration aplicada e usuário confirmou cancelamento, devolução/troca item a item e consistência de estoque; ver `docs/task-reports/TASK-011.md` | TASK-009, TASK-010 | RF-011, RF-013; RN-010 |
| TASK-012 | Implementar promoções de produto | DONE — usuário confirmou funcionamento após aplicar e validar a migration; relatório em `docs/task-reports/TASK-012.md` | TASK-010 | RF-014; RN-008 |
| TASK-013 | Implementar avaliações verificadas e moderação | DONE — migration aplicada e usuário confirmou elegibilidade, envio e moderação; ver `docs/task-reports/TASK-013.md` | TASK-009, TASK-010 | RF-015; RN-009 |
| TASK-014 | Implementar relatório de vendas | DONE — migration aplicada e usuário confirmou os totais; consulta direta retornou 2 pedidos, R$ 219,80 em produtos líquidos e R$ 30,00 de frete; ver `docs/task-reports/TASK-014.md` | TASK-010 | RF-016 |
| TASK-015 | Revisar segurança, responsividade, auditoria e operação | DONE — backup/restauração e reconciliação aprovados; usuário confirmou que a aplicação está funcionando; gates técnicos e revisão estática aprovados. Automação de produção permanece pendente até a escolha de hospedagem. Ver `docs/task-reports/TASK-015.md`. | TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 | RNF-001–RNF-010 |

Dependências formam um DAG; qualquer mudança deve preservar isso. TASK-015 depende das tarefas funcionais mesmo quando alguma fica formalmente fora do escopo após decisão aprovada; revise suas dependências se o escopo mudar, registrando justificativa e histórico.

## Contratos das tarefas

### TASK-001 — Confirmar restrições acadêmicas e decidir stack

- **Objetivo:** registrar linguagem, framework, banco, convenções, ambiente, formato e critérios exigidos pela faculdade/professor.
- **Estado:** DONE em 2026-11-05; decisão direta do usuário registrada em README.md e ADR-002. Exigências acadêmicas adicionais continuam pendentes e devem ser conferidas antes da entrega.
- **Depends on:** nenhuma.
- **Primary Changes:** atualização de `README.md`, ADRs e TASKS somente para decisões aprovadas; registrar PD-001 como resolvida.
- **Allowed Changes:** documentação de planejamento.
- **Incidental Changes Policy:** nenhuma mudança de código; quaisquer documentos relacionados precisam ser diretamente necessários à decisão.
- **Forbidden Changes:** implementação, escolha de stack sem evidência acadêmica, remover pendências sem decisão.
- **Critérios de aceitação:** decisão explícita do usuário registrada com data e rastreabilidade; React + TypeScript + Vite e Supabase/PostgreSQL documentados; itens acadêmicos adicionais permanecem explícitos como pendentes; dependências atualizadas sem ciclos.
- **Validação:** revisar rastreabilidade e DAG; confirmar que nenhuma decisão foi inferida como fato.
- **Definition of Ready:** usuário/professor fornece decisão explícita da stack ou restrições aplicáveis.
- **DoD:** decisão registrada em README/ADR, pendências remanescentes preservadas e links/IDs/referências revisados. Gates documentais 001–008 registrados no relatório da TASK.

### TASK-002 — Definir arquitetura executável, ambiente e modelo de dados

- **Objetivo:** derivar arquitetura e modelo lógico coerentes com stack confirmada e documentação aprovada.
- **Estado:** DONE em 2026-11-05; documentação arquitetural e modelo lógico revisados e rastreados.
- **Depends on:** TASK-001.
- **Primary Changes:** arquitetura, ADRs, modelo lógico e limites transacionais.
- **Allowed Changes:** documentação arquitetural; nenhum código.
- **Incidental Changes Policy:** apenas diagramas diretamente afetados.
- **Forbidden Changes:** alterar requisitos ou regras de negócio sem decisão explícita.
- **Critérios de aceitação:** entidades suportam contas, endereços, produto/variação, estoque/retenção, carrinho, pedido, pagamento simulado, promoção, avaliação e pós-venda; RLS, ambiente local e limites transacionais descritos.
- **Validação:** consistência com RF/RN e diagramas; sem ciclos de dependência.
- **Definition of Ready:** TASK-001 DONE.
- **DoD:** modelo e decisões documentados e rastreáveis. Evidência em `docs/task-reports/TASK-002.md`.

### TASK-003 — Preparar estrutura, execução local e persistência inicial

- **Objetivo:** estabelecer esqueleto executável conforme decisões acadêmicas.
- **Estado:** DONE em 2026-11-09 na branch `codex/task-003-local-supabase`; estrutura revisada, build e lint passaram, Supabase local iniciou e consulta `select 1 as connected` respondeu. A checagem posterior de status pelo WSL/Docker retornou `E_ACCESSDENIED`; a limitação está registrada em `docs/task-reports/TASK-003.md`.
- **Depends on:** TASK-002.
- **Primary Changes:** estrutura mínima do projeto, configuração local e persistência base.
- **Allowed Changes:** arquivos necessários ao esqueleto aprovado.
- **Incidental Changes Policy:** somente ajustes de configuração indispensáveis à execução.
- **Forbidden Changes:** funcionalidades de negócio, infraestrutura não aprovada, segredos reais no repositório.
- **Critérios de aceitação:** projeto inicia conforme instruções; conexão/configuração de persistência documentada; dados demonstrativos separados de produção.
- **Validação:** comandos definidos pelo projeto executam; resultado registrado.
- **Definition of Ready:** TASK-002 DONE e ambiente disponível.
- **DoD:** estrutura mínima revisada, documentação atualizada, nenhuma funcionalidade fora do escopo. Evidência em `docs/task-reports/TASK-003.md`.

### TASK-004 — Implementar autenticação, confirmação e recuperação

- **Objetivo:** implementar registro, login, confirmação de e-mail, recuperação e dados/endereço do cliente.
- **Estado:** DONE em 2026-11-09; usuário confirmou cadastro, confirmação, login, gestão de endereços e redefinição de senha funcionando. Migration aplicada e banco local atualizado. Branch `codex/task-004-auth` não pôde ser criada porque a permissão do workspace negou escrita em `.git`; alterações permanecem na branch atual `codex/task-003-local-supabase`.
- **Depends on:** TASK-002.
- **Primary Changes:** módulos de identidade e perfil.
- **Allowed Changes:** código, persistência e validações desses fluxos.
- **Incidental Changes Policy:** ajustes compartilhados só se necessários e registrados.
- **Forbidden Changes:** login social, autorização administrativa adicional ou envio externo não aprovado.
- **Critérios de aceitação:** usuário não confirmado não compra; senha protegida; cliente mantém múltiplos endereços; recuperação não revela se e-mail existe.
- **Validação:** cenários de sucesso, falha, autorização e privacidade definidos e executados.
- **Definition of Ready:** TASK-002 DONE; canal de demonstração definido.
- **DoD:** critérios atendidos e documentação atualizada. Evidência em `docs/task-reports/TASK-004.md`.

### TASK-005 — Implementar catálogo, busca, filtros e variações

- **Objetivo:** exibir catálogo e administrar dados de produto/categoria/variação.
- **Estado:** DONE em 2026-11-09; usuário aplicou migration/seed e confirmou que catálogo, busca, filtros, preço e variações funcionam. Evidência em `docs/task-reports/TASK-005.md`.
- **Depends on:** TASK-003.
- **Primary Changes:** domínio e interfaces de catálogo.
- **Allowed Changes:** produto, categoria, tamanho, cor, imagens e consultas de catálogo.
- **Incidental Changes Policy:** componentes compartilhados de apresentação estritamente necessários.
- **Forbidden Changes:** promoções, checkout e estoque transacional.
- **Critérios de aceitação:** navegação, busca por nome e filtros acordados funcionam; disponibilidade distingue variações.
- **Validação:** casos de filtro combinado, sem resultado e variação indisponível.
- **Definition of Ready:** TASK-003 DONE, modelo aprovado e convenção monetária escolhida/documentada.
- **DoD:** critérios cobertos e acessibilidade básica da interface documentada. Evidência em `docs/task-reports/TASK-005.md`.

### TASK-006 — Implementar carrinho e cálculo de frete

- **Objetivo:** manter carrinho e apresentar total incluindo frete por CEP.
- **Estado:** DONE em 2026-11-09; build/lint passaram, migration local aplicada e usuário confirmou carrinho, quantidades, endereço, frete e total funcionando. Evidência em `docs/task-reports/TASK-006.md`.
- **Depends on:** TASK-004, TASK-005.
- **Primary Changes:** carrinho e cálculo determinístico de frete aprovado.
- **Allowed Changes:** validação de quantidades, resumo e serviço de frete.
- **Incidental Changes Policy:** alterações de endereço somente para dados exigidos pelo cálculo aprovado.
- **Forbidden Changes:** cotação postal externa ou alterar tarifa aprovada.
- **Critérios de aceitação:** cliente autenticado edita carrinho; total é reproduzível e inclui frete calculado pelo CEP segundo regra aprovada.
- **Validação:** CEP válido/inválido, carrinho vazio, quantidades e arredondamento.
- **Definition of Ready:** TASK-004/005 DONE; frete regional e UF definidos em RN-007.
- **DoD:** regras, moeda e cenários documentados. Evidência em `docs/task-reports/TASK-006.md`.

### TASK-007 — Implementar retenção concorrente e expiração de estoque

- **Objetivo:** impedir sobrealocação durante pagamento simulado.
- **Estado:** DONE em 2026-11-09; migration aplicada e roteiro `supabase/validation/task-007-concurrency.sh` passou: uma de duas sessões reteve a última unidade, a outra foi recusada; repetição, liberação, expiração simulada e saldo físico inalterado também passaram. Evidência em `docs/task-reports/TASK-007.md`.
- **Depends on:** TASK-006.
- **Primary Changes:** serviço transacional de disponibilidade, retenção e expiração.
- **Allowed Changes:** estoque por produto/tamanho/cor e registros de retenção.
- **Incidental Changes Policy:** mecanismo de agendamento somente se necessário e aprovado pela stack.
- **Forbidden Changes:** aceitar estoque negativo ou manter retenção após expiração.
- **Critérios de aceitação:** corrida por última unidade concede apenas uma retenção; recusa/expiração libera estoque; aprovação consome/baixa uma única vez.
- **Validação:** cenários concorrentes e transições repetidas/idempotentes.
- **Definition of Ready:** TASK-006 DONE e limites transacionais aprovados.
- **DoD:** invariantes demonstradas e observabilidade de falhas documentada.

### TASK-008 — Implementar pagamento simulado e criação consistente de pedido

- **Objetivo:** registrar resultado selecionado pelo cliente e transicionar pedido/estoque consistentemente.
- **Estado:** DONE em 2026-11-09 após TASK-007 DONE; migration e roteiro de aprovação tardia passaram, build/lint passaram e o usuário confirmou recusa, motivo, carrinho, aprovação e repetição pela interface. Evidência em `docs/task-reports/TASK-008.md`.
- **Depends on:** TASK-007.
- **Primary Changes:** adaptador simulado, pedido e estados de pagamento.
- **Allowed Changes:** estados previstos em README, motivo de recusa, histórico interno.
- **Incidental Changes Policy:** ajustes do contrato entre checkout e estoque, sem novos meios de pagamento.
- **Forbidden Changes:** gateway real ou dados financeiros reais.
- **Critérios de aceitação:** aprovado confirma pedido; recusado mostra motivo e libera estoque; repetição da resposta não duplica pedido/baixa.
- **Validação:** fluxos aprovado, recusado, repetido e falha no processamento.
- **Definition of Ready:** TASK-007 DONE.
- **DoD:** estados e invariantes cobertos.

### TASK-009 — Implementar conta do cliente e fluxo de pedidos

- **Objetivo:** apresentar histórico, detalhe e atualizações de status; permitir solicitações pós-venda depois da regra aprovada.
- **Estado:** DONE em 2026-11-09 após TASK-008 DONE; usuário confirmou histórico, detalhes, atualização e isolamento entre contas. Build/lint passaram. Solicitações pós-venda continuam na TASK-011/PD-004. Evidência em `docs/task-reports/TASK-009.md`.
- **Depends on:** TASK-008.
- **Primary Changes:** área autenticada do cliente e histórico.
- **Allowed Changes:** visualização de pedidos e estados aprovados.
- **Incidental Changes Policy:** somente componentes compartilhados do portal.
- **Forbidden Changes:** notificação por e-mail e decisão automática de troca/devolução.
- **Critérios de aceitação:** cliente vê apenas próprios pedidos; estados exibidos correspondem ao histórico.
- **Validação:** acesso cruzado, pedido vazio e atualizações de status.
- **Definition of Ready:** TASK-008 DONE.
- **DoD:** acesso e estados conferidos.

### TASK-010 — Implementar painel e operações administrativas

- **Objetivo:** habilitar operações administrativas autorizadas.
- **Estado:** DONE em 2026-11-09; migration aplicada, conta inicial provisionada e usuário confirmou painel e operações administrativas funcionando. Relatório em `docs/task-reports/TASK-010.md`.
- **Depends on:** TASK-004, TASK-005, TASK-008.
- **Primary Changes:** painel, gestão de contas iguais, catálogo, estoque, pedidos e usuários.
- **Allowed Changes:** fluxos RF-012, RF-013, RF-017.
- **Incidental Changes Policy:** controles de acesso comuns apenas se diretamente necessários.
- **Forbidden Changes:** papéis adicionais, impersonação de clientes, promoção ou relatório além das tarefas próprias.
- **Critérios de aceitação:** primeira conta é provisionável com segurança; administrador gerencia operações; cliente sem permissão recebe negação; transições inválidas não são aceitas.
- **Validação:** autorização por papel e validação de transições.
- **Definition of Ready:** dependências DONE e mecanismo seguro de bootstrap aprovado.
- **DoD:** ações administrativas relevantes são auditáveis.

### TASK-011 — Implementar solicitações pós-venda

- **Objetivo:** registrar e administrar cancelamentos, trocas e devoluções segundo política aprovada.
- **Estado:** DONE em 2026-11-09 após migration aplicada e usuário confirmar cancelamento, devolução/troca item a item e consistência de estoque. Build/lint/diff check passaram. Relatório em `docs/task-reports/TASK-011.md`.
- **Depends on:** TASK-009, TASK-010.
- **Primary Changes:** solicitação, elegibilidade e decisão administrativa.
- **Allowed Changes:** fluxos pós-venda aprovados e respectivos estados.
- **Incidental Changes Policy:** ajustes de pedido apenas para as transições aprovadas.
- **Forbidden Changes:** inferir prazo, reembolso financeiro real ou política legal não definida.
- **Critérios de aceitação:** elegibilidade segue prazos e condições aprovados; cliente solicita; administrador decide e histórico é preservado.
- **Validação:** limite de prazo, decisão, duplicidade e autorização.
- **Definition of Ready:** PD-002 e PD-004 resolvidas; requisitos legais de arrependimento preservados; PD-009 restrita a defeitos/garantia e estorno real fora do fluxo simulado.
- **DoD:** regras publicadas e fluxos auditáveis.

### TASK-012 — Implementar promoções de produto

- **Objetivo:** administrar descontos de produto com janela de validade.
- **Estado:** DONE em 2026-11-10; migration `20261109000009_product_promotions.sql` aplicada e o usuário confirmou que as promoções estão funcionando. Build/lint/diff check passaram.
- **Depends on:** TASK-010.
- **Primary Changes:** regras e interface de promoção.
- **Allowed Changes:** desconto de produto e data inicial/final.
- **Incidental Changes Policy:** atualização do preço apresentado no catálogo/carrinho.
- **Forbidden Changes:** cupons, acúmulo, limite presumido ou regras complexas.
- **Critérios de aceitação:** promoção só vigora na janela e produto configurados; conflito segue regra aprovada.
- **Validação:** build, lint e diff check locais passaram; usuário confirmou aplicação e funcionamento manual das promoções, incluindo os cenários relevantes.
- **Definition of Ready:** PD-005 resolvida; promoção por produto com datas inicial/final e maior desconto efetivo, desempate pelo início mais recente.
- **DoD:** preço promocional rastreável e apresentado sem ambiguidade; preço, desconto e total do pedido são calculados no banco. Relatório em `docs/task-reports/TASK-012.md`.

### TASK-013 — Implementar avaliações verificadas e moderação

- **Objetivo:** permitir avaliação elegível e moderação.
- **Estado:** DONE em 2026-11-09; migration aplicada e usuário confirmou submissão de avaliação verificada e moderação funcionando. Relatório em `docs/task-reports/TASK-013.md`.
- **Depends on:** TASK-009, TASK-010.
- **Primary Changes:** avaliação nota/comentário e fila de moderação.
- **Allowed Changes:** RF-015 e visibilidade da avaliação.
- **Incidental Changes Policy:** exibição no produto apenas quando necessário.
- **Forbidden Changes:** avaliação de não comprador, múltiplas avaliações por cliente/produto ou comentários públicos sem moderação aprovada.
- **Critérios de aceitação:** compra comprovada; unicidade cliente/produto; administrador modera/oculta.
- **Validação:** elegibilidade, duplicidade e permissão.
- **Definition of Ready:** pedido e identidade utilizáveis.
- **DoD:** regra de verificação e moderação coberta.

### TASK-014 — Implementar relatório de vendas

- **Objetivo:** fornecer relatório administrativo conforme métricas aprovadas.
- **Estado:** DONE em 2026-11-09; migration aplicada e usuário confirmou que o painel bateu com consulta direta: 2 pedidos, R$ 219,80 em produtos líquidos e R$ 30,00 de frete. Relatório em `docs/task-reports/TASK-014.md`.
- **Depends on:** TASK-010.
- **Primary Changes:** consultas e interface de relatório.
- **Allowed Changes:** métricas e filtros acordados.
- **Incidental Changes Policy:** índices somente se evidência de consulta justificar.
- **Forbidden Changes:** expor dados pessoais desnecessários ou inventar definição de venda.
- **Critérios de aceitação:** totais e filtros correspondem às definições aprovadas.
- **Validação:** amostras calculadas manualmente e autorização.
- **Definition of Ready:** TASK-010 DONE.
- **DoD:** métricas documentadas e resultados conferidos.

### TASK-015 — Revisar segurança, responsividade, auditoria e operação

- **Objetivo:** verificar requisitos transversais, backup/restauração e funcionamento responsivo.
- **Estado:** DONE em 2026-11-10. Após o primeiro restore falhar em `vault.secrets`, usuário autorizou excluir somente os dados dessa tabela interna; script/runbook foram atualizados. Segundo backup e restore temporário executados sem erro visível; oito contagens foram iguais; limpeza do temporário confirmada pelo usuário. O usuário confirmou que a aplicação está funcionando; essa confirmação encerra o QA manual (M-001/M-003/M-004), sem capturas ou telemetria independente neste ambiente. M-002/M-006 estão aprovados pelas evidências anteriores. Build/lint/diff check passaram. Automação de produção segue pendente até decisão de hospedagem, conforme escopo aprovado.
- **Depends on:** TASK-004, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009, TASK-010, TASK-011, TASK-012, TASK-013, TASK-014.
- **Primary Changes:** correções transversais justificadas e documentação operacional.
- **Allowed Changes:** apenas lacunas comprovadas em RNF-001–RNF-010.
- **Incidental Changes Policy:** toda mudança não primária precisa de justificativa, teste e registro; caso amplie escopo, parar e solicitar direção.
- **Forbidden Changes:** desativar validações, remover cobertura, incluir infraestrutura/serviços externos não aprovados.
- **Critérios de aceitação:** requisitos não funcionais têm evidência verificável; procedimento de backup/restauração documentado; interface revista nas classes de dispositivo aprovadas.
- **Validação:** executar quality gates definidos em AGENTS.md e registrar resultados reais.
- **Definition of Ready:** tarefas predecessoras concluídas e backup/restauração com ambiente disponível.
- **DoD:** achados resolvidos ou registrados como pendência explicitamente aceita.

## Definition of Ready global

Uma TASK pode ir a `READY` somente quando objetivo, escopo, critérios, dependências, requisitos rastreados e decisões necessárias estiverem definidos; ambiente e restrições estiverem disponíveis; e o Scope Guard puder ser aplicado sem interpretação de negócio.

## Definition of Done global

Critérios de aceitação atendidos; validações indicadas executadas e resultados registrados; mudanças limitadas ao escopo; documentação/rastreabilidade atualizadas; revisão de segurança e acessibilidade proporcional ao fluxo; tarefa marcada `DONE` somente com evidência. Não afirmar que algo foi testado sem executar a validação.
