# TASK-015 — Revisão transversal

## Status e escopo

- Estado: DONE em 2026-11-10; segundo dump restaurado sem erro visível, oito contagens conferem, limpeza concluída e usuário confirmou que a aplicação está funcionando.
- Dependências: TASK-004 a TASK-014 DONE no backlog e com evidências nos relatórios, com uma divergência documental antiga em TASK-006 registrada abaixo.
- Requisitos: RNF-001–RNF-010.
- Scope Guard: revisar/corrigir apenas lacunas comprovadas; documentação operacional de backup aprovada; sem serviços externos, infraestrutura adicional ou alterações de negócio sem decisão.
- Decisões recebidas em 2026-11-10: QA nos viewports 375×812 (celular), 768×1024 (tablet) e 1440×900 (desktop); backup lógico diário local, retenção 7 dias fora do repositório e ensaio de restauração; automação de produção permanece pendente até escolha de hospedagem.

## Gates

| Gate | Etapa | Estado | Evidência |
|---|---|---|---|
| GATE-001 | Recontextualização e prontidão | APROVADO | Resultado registrado na conversa em 2026-11-10; branch `codex/task-003-local-supabase`, working tree preexistente preservado. |
| GATE-002 | Contexto e histórico | APROVADO | Resultado registrado na conversa em 2026-11-10; relatórios TASK-004–014 consultados e histórico Git inspecionado. |
| GATE-003 | Validação de pré-condições | APROVADO | TASKs dependentes DONE; Supabase local em execução conforme `npx supabase status` enviado pelo usuário; decisões acima confirmadas explicitamente. PD-007 resolvida para escopo acadêmico/local; produção segue pendente. |
| GATE-004 | Planejamento | APROVADO | Plano e rollback registrados abaixo; escopo limitado a RNF-001–010. Referência de dump investigada: Supabase CLI exclui schemas gerenciados no dump padrão. |
| GATE-005 | Implementação controlada | APROVADO | Exclusão apenas dos dados de `vault.secrets` aprovada e documentada; usuário executou novo backup e `pg_restore` terminou sem mensagem de erro. |
| GATE-006 | Revisão e gate técnico | APROVADO | Build, lint e diff check passaram após alteração; usuário executou o script atualizado e o restore terminou sem mensagem de erro. |
| GATE-007 | Testes manuais | APROVADO | O usuário confirmou em 2026-11-10 que a aplicação está funcionando, encerrando o QA manual de interface e fluxo. Não foram fornecidas capturas nem resultados detalhados por viewport/log; as revisões estáticas e as evidências anteriores de autorização/concorrência constam abaixo. |
| GATE-008 | Conclusão | APROVADO | Critérios atendidos com evidências técnicas, operacionais e confirmação manual do usuário; automação de produção permanece como pendência documentada até escolha de hospedagem. |

## Achados prévios

- A divergência do relatório TASK-006 foi reconciliada durante a implementação: conversa e backlog confirmavam funcionamento, e o texto pendente era obsoleto.
- Vários arquivos de implementação e documentação estão no working tree sem commit. Este trabalho preexistente foi preservado; nenhum commit será criado automaticamente.
- O stack Supabase local reportado pelo usuário tem PostgreSQL, Auth, REST, Kong e Mailpit ativos; outros serviços opcionais aparecem parados.

## Evidências de validação

Build, lint e diff check constam abaixo. O usuário executou backup e restauração isolada, reconciliou as contagens e confirmou que a aplicação está funcionando.
## Plano aprovado — GATE-004

1. **Segurança e privacidade (RNF-002–004, RNF-009):** revisar grants/RLS e RPCs existentes, referências a segredos e caminhos de erro visíveis ao usuário. Corrigir apenas exposição comprovada; normalizar mensagens e registrar diagnóstico sem tokens, senhas, dados pessoais desnecessários ou pagamento.
2. **Integridade e auditoria (RNF-005–007):** revisar transações de checkout/pós-venda, regras de estoque e trilhas administrativas/histórico. Não alterar migrations de domínio sem defeito reproduzido.
3. **Responsividade e acessibilidade (RNF-001):** iniciar Vite e verificar fluxos críticos nos viewports aprovados 375×812, 768×1024 e 1440×900; registrar falhas visuais/acessibilidade e corrigir somente as comprovadas.
4. **Backup e recuperação (RNF-008):** criar procedimento/script local que grave fora do repositório, exija destino explícito, restrinja permissões, mantenha 7 arquivos diários e não exponha conteúdo em logs. Fazer dump completo do banco local, incluindo schema `auth`; a referência oficial do Supabase informa que o `supabase db dump` padrão exclui schemas gerenciados como `auth`, portanto não atende sozinho a uma recuperação integral de contas. Ensaiar restauração somente em banco isolado não produtivo, comparar tabelas/contagens e descartar apenas o banco temporário criado pelo ensaio. Não executar `db reset` no projeto atual.
5. **Documentação e rastreio (RNF-010):** corrigir divergências comprovadas, incluindo a situação de validação no relatório TASK-006 e a linha de promoções que ainda diz que o desempate está pendente. Atualizar runbook e matriz de evidências por RNF.
6. **Gates técnicos:** `npm run build`, `npm run lint`, `git diff --check`; revisar alterações introduzidas e manter mudanças preexistentes. Nenhuma dependência nova prevista.
7. **QA manual posterior (GATE-007):** M-001 viewports e fluxos principais; M-002 tentativas de acesso cruzado/admin por cliente; M-003 entradas inválidas e mensagens; M-004 logs sem segredos; M-005 dump, restauração isolada e reconciliação; M-006 concorrência/consistência usando procedimentos existentes; M-007 recuperar seguindo o runbook e registrar o resultado.

**Arquivos candidatos:** novos `supabase/backup-local.sh` e `docs/operations/backup-restore.md`; atualização de `README.md`, `docs/architecture/data-model.md`, `docs/task-reports/TASK-006.md` e deste relatório; possíveis correções mínimas em `src/features/admin/AdminPanel.tsx`, `src/features/auth/AuthPage.tsx`, `src/App.css` e CSS das features somente se a revisão/QA provar a lacuna. Migrations não são alvo planejado.

**Fora do escopo:** automação de produção até escolha de hospedagem (PD-007 residual), SMTP hospedado, armazenamento externo, novo serviço/dependência, alterações de regra de negócio, mudanças de schema sem achado reproduzível e limpeza/refatoração geral.

**Riscos e controles:** o dump contém dados de conta (incluindo hashes) e dados pessoais; destino será informado pelo operador, fora do repositório, com permissões restritas. Restauração em alvo incorreto pode sobrescrever dados; por isso, procedimento usará banco temporário explicitamente identificado e abortará se o destino não for isolado. Rollback: remover apenas script/runbook/correções criados nesta TASK; não reverter arquivos preexistentes nem migrations já aplicadas; encerrar apenas o banco temporário de ensaio após reconciliação.

**Autorização:** o usuário instruiu “termine a task 15”; essa autorização cobre as mudanças mínimas acima dentro do Scope Guard. Sem decisão pendente para iniciar a etapa 005.



## Implementação controlada — GATE-005

### Escopo aplicado

- Criado `supabase/backup-local.sh`: requer caminho absoluto preexistente fora do repositório, verifica container local, grava dump PostgreSQL custom format incluindo schemas do banco (incluindo `auth`), modo 600, limpeza do parcial em erro e retenção dos sete dumps mais recentes do projeto. Não imprime conteúdo do dump.
- Criado `docs/operations/backup-restore.md`: frequência/retensão, proteção de dados, ensaio em PostgreSQL isolado e reconciliação sem restaurar no banco em uso.
- README atualizado com procedimento, critérios de viewport definidos e política de promoção já resolvida.
- `docs/task-reports/TASK-006.md` reconciliado com estado DONE e confirmação anterior do usuário.
- Nenhuma dependência, migration ou regra de negócio adicionada/alterada.

### Validações desta etapa

- Revisão estática do script e documentação concluída; sem connection string ou segredo no procedimento.
- A execução real do backup/restauração e inspeção visual não ocorreu nesta etapa. A tentativa de chamar WSL a partir do ambiente de execução retornou `Wsl/E_ACCESSDENIED`; a saída anterior do usuário demonstra que o WSL dele e o Supabase funcionam quando executados pelo terminal dele.
- Resultado da ETAPA 005: implementação documental/script concluída; gate técnico ainda exige `npm run build`, `npm run lint`, `git diff --check` e QA via execução manual.



## QA manual — GATE-007 (roteiro a executar)

| Caso | Procedimento/evidência esperada | Estado |
|---|---|---|
| M-001 | Abrir `http://localhost:5173` e validar catálogo, detalhe, conta, carrinho e painel nos viewports 375×812, 768×1024 e 1440×900; anotar overflow/falhas ou anexar capturas. | APROVADO por confirmação do usuário em 2026-11-10 de que a aplicação está funcionando. Não foram fornecidas capturas nem notas separadas por viewport; o navegador estava indisponível neste agente. |
| M-002 | Isolamento de pedidos entre contas foi confirmado pelo usuário na TASK-009; painel e operações administrativas têm checagem de papel/RLS (TASK-010), e conta cliente não consegue acessar operações admin segundo validações registradas. | APROVADO com evidências anteriores TASK-009/010. |
| M-003 | Enviar formulário inválido e conferir mensagem genérica; não deve conter SQL, stack, tokens ou dados de outra conta. | APROVADO pelo QA manual que o usuário resumiu como “está tudo funcionando”; revisão estática de validação/erros complementa a evidência. Nenhum detalhe de formulário ou captura foi fornecido. |
| M-004 | Conferir console/browser e logs locais após login, erro de pedido e atualização de status; não pode haver senha, token, service-role, endereço completo ou dados financeiros. | APROVADO pelo QA manual que o usuário resumiu como “está tudo funcionando” e pela revisão estática sem referências a logger/console em `src`; sem exportação de logs ou inspeção independente do navegador neste ambiente. |
| M-005 | Segundo dump: `/home/arthur/backups/loja-online/loja-online-20261110T175419Z.dump`, 293298 bytes, modo 600. `pg_restore --exit-on-error` terminou sem erro visível. Usuário comparou contagens iguais nos bancos `postgres` e `loja_restore_qa`: auth.users 2; profiles 2; products 4; orders 4; order_items 4; promotions 1; reviews 1; after_sales_requests 0. Usuário removeu a database temporária e o arquivo copiado para `/tmp` do container. | APROVADO. |
| M-006 | `bash supabase/validation/task-007-concurrency.sh` passou: segunda sessão recusada na última unidade; idempotência, liberação, expiração e saldo físico passaram. `npx supabase db query --file supabase/validation/task-008-expiry.sql` retornou `DO`. Evidências nos relatórios TASK-007/008 e saída do usuário. | APROVADO com evidências anteriores TASK-007/008. |
| M-007 | Procedimento de backup/restore revisado; ensaio de restauração reconciliado e recursos temporários removidos pelo usuário. | APROVADO. |

### Gates técnicos observados

- `npm run build`: APROVADO; chunk principal 514.07 kB gerou aviso Vite acima do limite informativo 500 kB.
- `npm run lint`: APROVADO (zero warnings ESLint).
- `git diff --check`: APROVADO; somente avisos Git sobre normalização LF/CRLF.
- Revisão de configuração/SQL: nenhuma chave Secret/service-role referenciada no código de frontend; `src/lib/supabase.ts` aceita apenas URL e publishable key; RPCs sensíveis usam `SECURITY DEFINER` com `search_path` fechado; grants/RLS estão definidos nas migrations.
- Script de backup: usuário executou com sucesso; saída confirmou arquivo, 293578 bytes e permissão 600; a execução validou a sintaxe Bash.
- QA manual encerrado com a confirmação explícita do usuário de que está tudo funcionando. Limite da evidência: sem capturas de tela, resultados individualizados por viewport ou exportação de logs; o navegador não estava disponível neste agente.




### Evidência recebida depois da ETAPA 005

- Primeiro backup: `/home/arthur/backups/loja-online/loja-online-20261110T174446Z.dump`, 293578 bytes, permissão 600.
- Após a alteração aprovada para omitir somente os dados de `vault.secrets`, o usuário gerou `/home/arthur/backups/loja-online/loja-online-20261110T175419Z.dump`, 293298 bytes, permissão 600, e executou `pg_restore --exit-on-error` no banco temporário `loja_restore_qa` sem erro visível. As oito contagens essenciais foram iguais nos bancos original e restaurado. O usuário removeu `loja_restore_qa` e `/tmp/loja-restore-qa.dump` após a reconciliação.
- GATE-006 aprovado: build/lint passaram após a alteração; `git diff --check` passou; revisão técnica realizada.
- O usuário confirmou em 2026-11-10 que está tudo funcionando; M-001/M-003/M-004 foram encerrados com essa confirmação. Limite: não há capturas, resultados individualizados por viewport nem exportação de logs, pois navegador não estava disponível neste agente. M-002/M-006 reutilizam evidências validadas das TASK-007–010.
### Resultado do primeiro ensaio de restauração

- Primeiro ensaio: `pg_restore` falhou em `vault.secrets` por permissão; banco temporário foi removido. O usuário autorizou excluir seus dados. Segundo ensaio, com dump corrigido, terminou sem erro visível; as oito contagens conferem e o usuário confirmou a remoção do banco temporário e do dump copiado para `/tmp` no container.
### Decisão sobre `vault.secrets`

- O usuário autorizou excluir somente os dados da tabela interna `vault.secrets` dos backups; a definição do schema/tabela permanece. A aplicação não usa esse schema. Esta escolha e seu limite estão documentados em `docs/operations/backup-restore.md`.
- Implementado `--exclude-table-data=vault.secrets` em `supabase/backup-local.sh`. GATE-005/GATE-006 aprovados após novo backup/restore sem erro visível e validação técnica; contagens conferidas pelo usuário.
