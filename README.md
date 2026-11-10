# Loja Online de Roupas e Acessórios

## Objetivo

Construir uma loja online responsiva para vender roupas e acessórios no Brasil. Clientes poderão descobrir produtos, comprar variações disponíveis, acompanhar pedidos e avaliar itens adquiridos. Administradores gerenciarão catálogo, estoque, pedidos, clientes, promoções e avaliações.

Este documento registra o escopo e as decisões aprovadas para o planejamento inicial. Ele não autoriza escolhas pendentes nem implementação fora das tarefas de [`TASKS.md`](TASKS.md).

## Atores

- **Visitante:** explora e pesquisa o catálogo; precisa criar conta e confirmar o e-mail para comprar.
- **Cliente:** mantém dados e endereços, compra, acompanha pedidos e avalia produtos que comprou.
- **Administrador:** tem as mesmas permissões que os demais administradores; gerencia a operação da loja.
- **Sistema de pagamento simulado:** recebe uma escolha de aprovação ou recusa feita pelo cliente na demonstração e devolve o resultado e, em caso de recusa, um motivo.

## Escopo funcional

### Catálogo e conta

- Criar conta com nome, e-mail, senha e dados básicos de endereço; confirmar e-mail e recuperar senha.
- Manter mais de um endereço por cliente.
- Navegar por categorias, pesquisar por nome e filtrar por categoria, tamanho, cor e preço.
- Exibir detalhes de produto, imagens e disponibilidade por variação de tamanho e cor.

### Compra e pedidos

- Adicionar variações e quantidades ao carrinho, alterar ou remover itens e ver o total.
- Exigir conta autenticada para finalizar compra; selecionar endereço e consultar frete calculado por CEP.
- Verificar disponibilidade antes de seguir ao pagamento. Reter temporariamente as unidades necessárias durante o pagamento, inclusive a última unidade, para impedir concorrência. A retenção dura 15 minutos; recusa ou expiração libera a quantidade.
- Simular pagamento aprovado ou recusado pela escolha do cliente. Em recusa, exibir o motivo.
- Mostrar histórico e atualizações do pedido dentro da conta. Estados principais: pedido realizado, pagamento aprovado, em preparação, enviado, entregue, pagamento recusado e pedido cancelado.
- Permitir solicitação de arrependimento/devolução em até 7 dias corridos do recebimento, conforme legislação aplicável, e troca voluntária em até 30 dias do recebimento. Administrador processa e registra solicitações; arrependimento legal não depende de aprovação discricionária. Defeitos/garantia ficam em fluxo separado, ainda a especificar.

### Operação da loja

- Administradores criam, editam e excluem produtos, categorias, tamanhos, cores e estoque; consultam e atualizam pedidos; gerenciam usuários; moderam avaliações; consultam relatórios de vendas.
- Criar promoções com data de início e término aplicadas a produtos. Sem limite de uso no MVP e sem acumular descontos.
- Administradores têm permissões iguais. A primeira conta administrativa é criada no cadastro inicial do projeto.

### Avaliações

- Somente cliente com pedido entregue contendo o produto pode avaliá-lo.
- Uma avaliação por cliente e produto, com nota e comentário; ela começa oculta e só fica pública após aprovação administrativa. Administrador pode também ocultá-la depois.

## Requisitos funcionais

| ID | Requisito | Critério de aceitação resumido |
|---|---|---|
| RF-001 | Criar conta, confirmar e-mail, autenticar e recuperar senha | Conta usa nome, e-mail e senha; e-mail precisa ser confirmado para habilitar a compra. |
| RF-002 | Gerenciar perfil e endereços | Cliente edita dados e mantém vários endereços. |
| RF-003 | Descobrir produtos | Categorias, busca por nome e filtros por tamanho, cor, preço e categoria retornam produtos correspondentes. |
| RF-004 | Consultar produto e variações | Detalhe exibe descrição, imagens, preço e disponibilidade por tamanho/cor. |
| RF-005 | Gerenciar carrinho | Cliente adiciona, altera quantidade, remove itens e consulta total. |
| RF-006 | Finalizar pedido com conta | Checkout exige autenticação e e-mail confirmado, endereço, frete e confirmação do resumo. |
| RF-007 | Calcular frete por CEP | Checkout usa CEP e UF do endereço para identificar a região e aplica a tarifa fixa por pedido definida em RN-007. |
| RF-008 | Controlar disponibilidade e retenção | Não permite que duas finalizações retenham a mesma unidade; recusa/expiração libera retenção. |
| RF-009 | Simular pagamento | Cliente escolhe aprovação/recusa; recusa apresenta motivo; aprovação confirma pedido e estoque. |
| RF-010 | Consultar pedidos | Cliente vê histórico e estado atual, incluindo os estados aprovados neste documento. |
| RF-011 | Solicitar pós-venda | Cliente solicita arrependimento em até 7 dias corridos do recebimento ou troca voluntária em até 30 dias; administrador processa a solicitação. Defeito/garantia tem fluxo legal separado. |
| RF-012 | Administrar catálogo e estoque | Administrador gerencia produtos, categorias, variações e quantidades disponíveis. |
| RF-013 | Administrar pedidos e usuários | Administrador consulta pedidos/usuários e atualiza pedidos conforme transições permitidas. |
| RF-014 | Administrar promoções | Administrador cria promoção de produto com início e término; sem limite de usos e sem acúmulo no MVP. |
| RF-015 | Avaliar produto comprado | Cliente elegível registra nota e comentário, uma vez por produto; administrador modera/oculta. |
| RF-016 | Consultar relatório de vendas | Administrador consulta intervalo por data de aprovação, contagem e valor de pedidos aprovados não cancelados, produtos líquidos de descontos e frete separado. |
| RF-017 | Provisionar administradores | Cadastro inicial do projeto cria primeira conta; administradores têm permissões iguais. |

## Requisitos não funcionais

| ID | Requisito verificável |
|---|---|
| RNF-001 | Interface responsiva deve permitir uso em celular (375×812), tablet (768×1024) e desktop (1440×900), viewports aprovados pelo usuário para QA da TASK-015. |
| RNF-002 | Senhas devem ser armazenadas com algoritmo de hash de senha apropriado; nunca em texto simples. |
| RNF-003 | A autorização deve impedir clientes de acessar operações administrativas e dados de outros clientes. |
| RNF-004 | Entradas de formulário e regras de domínio devem ser validadas no servidor, além de validações úteis na interface. |
| RNF-005 | Operações concorrentes de estoque devem preservar a invariante de que unidades disponíveis não ficam negativas e não são retidas por mais de um checkout ativo. |
| RNF-006 | Alterações administrativas, transições de pedido e eventos de autenticação relevantes devem gerar registros operacionais/auditáveis sem expor segredos. |
| RNF-007 | Banco de dados deve preservar integridade referencial e consistência das alterações de pedido, pagamento e estoque. |
| RNF-008 | Executar backup lógico diário, manter os últimos 7 dias fora do repositório e realizar restauração de ensaio antes da entrega acadêmica. |
| RNF-009 | Falhas devem ser registradas para diagnóstico sem expor senhas, tokens ou dados de pagamento em logs. |
| RNF-010 | A implantação deve operar em português e tratar valores monetários em reais e endereços brasileiros; stack e infraestrutura ficam pendentes das orientações acadêmicas. |

## Regras de negócio

- **RN-001:** a loja atende somente clientes/endereço de entrega no Brasil.
- **RN-002:** compra exige conta autenticada e e-mail confirmado.
- **RN-003:** estoque é controlado pela combinação de produto, tamanho e cor.
- **RN-004:** cada checkout precisa obter disponibilidade exclusiva antes de iniciar pagamento; uma unidade não pode ser retida por dois checkouts.
- **RN-005:** a retenção dura 15 minutos. Recusa ou expiração libera a quantidade. Aprovação confirma a compra e baixa/reserva definitivamente o estoque.
- **RN-006:** pagamento é simulado e sua decisão de aprovado/recusado é selecionada pelo cliente na demonstração; recusa apresenta motivo.
- **RN-007:** o CEP é armazenado com a UF do endereço; a UF determina a região. Frete fixo por pedido: Sudeste R$ 15, Sul R$ 20, Centro-Oeste R$ 25, Nordeste R$ 30, Norte R$ 40. Valores demonstrativos do MVP, sem cotação postal.
- **RN-008:** cada promoção inicial aplica-se a produto e possui início e fim; sem limite de usos no MVP e sem acumular descontos. Se houver promoções simultâneas, aplica-se o maior desconto; em empate, prevalece a promoção iniciada mais recentemente (PD-005 resolvida pelo usuário).
- **RN-009:** avaliação requer compra do produto e permite uma avaliação por cliente/produto; contém nota e comentário e pode ser moderada/ocultada.
- **RN-010:** arrependimento em até 7 dias corridos do recebimento será processado conforme a legislação aplicável; a loja custeia o frete de retorno e o administrador registra/processa sem poder negar discricionariamente o direito legal. Troca voluntária em até 30 dias depende de análise operacional; a loja também custeia o frete de retorno. Estoque de devolução/troca só volta após recebimento e conferência. Cancelamento aprovado antes do envio repõe estoque imediatamente; após envio usa fluxo de devolução. Defeitos/garantia e estorno financeiro real ficam fora do fluxo simulado. Referências: [CDC, art. 49](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) e [orientação Senacon](https://www.gov.br/mj/pt-br/assuntos/arquivos-imprensa/senacon/cartilha-black-friday-senacon-2025).
- **RN-011:** administradores têm permissões equivalentes; a conta inicial é criada no provisionamento inicial do sistema.
- **RN-012:** confirmação e acompanhamento são apresentados na conta. E-mail transacional fica para etapa futura.
- **RN-013:** o relatório filtra por data de aprovação do pagamento e apresenta quantidade de pedidos, total de produtos após descontos e frete total em linha separada; pedidos cancelados são excluídos. As datas do intervalo usam dias corridos no fuso America/Sao_Paulo.

## Casos de uso principais

| ID | Caso de uso | Atores | Resultado |
|---|---|---|---|
| UC-001 | Criar e confirmar conta | Visitante | Cliente pode autenticar e manter seus dados. |
| UC-002 | Buscar e consultar catálogo | Visitante, cliente | Produtos e variações disponíveis são apresentados. |
| UC-003 | Montar carrinho | Cliente | Carrinho contém variações e quantidades válidas. |
| UC-004 | Finalizar compra | Cliente, sistema de pagamento simulado | Pedido, pagamento e estoque ficam consistentes. |
| UC-005 | Acompanhar pedido | Cliente | Cliente consulta histórico e estado. |
| UC-006 | Solicitar cancelamento/troca/devolução | Cliente, administrador | Solicitação é registrada e decidida por administrador. |
| UC-007 | Administrar catálogo e estoque | Administrador | Catálogo e quantidade por variação são atualizados. |
| UC-008 | Administrar pedidos | Administrador | Pedido avança por transição válida. |
| UC-009 | Criar promoção | Administrador | Promoção de produto fica ativa na janela configurada. |
| UC-010 | Avaliar compra | Cliente, administrador | Avaliação elegível é registrada e moderável. |
| UC-011 | Consultar vendas | Administrador | Relatório apresenta métricas acordadas. |

## Fora do escopo inicial

- Integração com gateway real, captura de cartão ou processamento financeiro real.
- Notificações por e-mail/SMS/push.
- Aplicativos nativos; a interface web responsiva atende celulares, tablets e computadores.
- Acúmulo de promoções, cupons e regras promocionais avançadas.
- Operação internacional.
- Cotação postal real e consulta automática de CEP por provedor externo.
- Reembolso/estorno financeiro real e processo de defeito/garantia enquanto PD-009 não for resolvida.

## Pendências de decisão

| ID | Pendente | Impacto / próximo responsável |
|---|---|---|
| PD-001 | Restrições acadêmicas adicionais, versões/ferramentas e forma de entrega | React + TypeScript + Vite e Supabase/PostgreSQL foram escolhidos pelo usuário; confirmar exigências adicionais da faculdade antes de fechar ferramentas/entrega. |
| PD-002 | Estoque em pedidos tardios e cancelamentos após aprovação | RESOLVIDA em 2026-11-09: cancelamento administrativo antes do envio retorna estoque imediatamente; após envio usa fluxo de devolução, que repõe somente após recebimento/conferência. |
| PD-003 | Serviço externo de consulta CEP→endereço/região | MVP usa CEP/UF capturados no endereço; integração externa aguarda aprovação. |
| PD-004 | Condições operacionais de troca e logística de retorno | RESOLVIDA em 2026-11-09: loja paga o frete de retorno em arrependimento/devolução e troca; estoque retorna após recebimento e conferência. |
| PD-005 | Conflito entre promoções ativas no mesmo produto | RESOLVIDA em 2026-11-09: maior desconto prevalece; empate favorece a promoção com início mais recente. |
| PD-006 | Apresentação/formatos adicionais do relatório | Métricas-base definidas em RN-013; exportação e agrupamentos ficam fora do MVP. |
| PD-007 | Backup/recuperação | RESOLVIDA para o escopo acadêmico/local: backup lógico diário, retenção de 7 dias fora do repositório e ensaio de restauração; automação em produção fica pendente até a escolha de hospedagem. |
| PD-008 | Configuração de e-mail no ambiente hospedado | Supabase Auth definido; local usa Mailpit. SMTP hospedado fica para configuração do ambiente. |
| PD-009 | Defeito/garantia e efeitos de estorno financeiro real | Requer especificação e revisão antes de implementar qualquer valor real; fora do pagamento simulado. |

## Arquitetura proposta

Adotar aplicação em camadas: apresentação, casos de uso, domínio e persistência/integrações. O modelo, RLS e limites transacionais estão em [`docs/architecture/data-model.md`](docs/architecture/data-model.md). Visão: [`docs/architecture/overview.md`](docs/architecture/overview.md), [`docs/diagrams/architecture.mmd`](docs/diagrams/architecture.mmd) e [`docs/diagrams/order-flow.mmd`](docs/diagrams/order-flow.mmd).

### Stack selecionada

Por decisão do usuário em 2026-11-05, a aplicação usará **React com TypeScript e Vite**, **Supabase/PostgreSQL** e **Supabase Auth** para confirmação e recuperação de conta. Para demonstração local, e-mails serão capturados pelo Mailpit. Nenhuma credencial ou projeto Supabase foi fornecido; nunca grave chaves reais no repositório. Restrições acadêmicas adicionais que contradigam essa seleção continuam pendentes de confirmação pelo professor. A decisão está registrada em [`docs/adr/ADR-002-stack.md`](docs/adr/ADR-002-stack.md).

Valores monetários são armazenados e trafegados como centavos inteiros (`bigint` no banco) e formatados em reais na interface, conforme [`ADR-003`](docs/adr/ADR-003-monetary-values.md).

### Desenvolvimento local

Ambiente: Ubuntu no WSL 2, Docker Desktop com integração WSL, Node.js 22.12+ e npm. Runtime verificado nesta máquina: Node.js 24.13.0. No WSL, use a raiz `/mnt/c/Users/1781432512008/Documents/ChatGPT/Loja Online`.

Na configuração inicial, ficam ativos apenas Postgres, API, Auth e SMTP local (Mailpit). Studio, Realtime, Storage, Edge Functions, Analytics e seed de demonstração ficam desativados até uma tarefa que precise deles e/ou a decisão de armazenamento. Isso reduz serviços desnecessários ao esqueleto e não altera o modelo de dados aprovado.

1. Instale dependências: `npm ci`.
2. Crie `.env.local` a partir de `.env.example` e informe `VITE_SUPABASE_URL` e a chave **Publishable** indicada por `npx supabase status`. A chave publishable pode estar no frontend; nunca copie a chave **Secret** ou `service_role` para a aplicação web.
3. Inicie o Supabase local: `npx supabase start`; consulte URLs/chaves locais com `npx supabase status`.
4. Inicie a interface com `npm run dev` (Vite em `http://localhost:5173`).
5. Mensagens locais de confirmação/recuperação são capturadas pelo Mailpit/local SMTP, disponível pelo endereço mostrado por `supabase status`.
6. Encerre o stack local com `npx supabase stop`.

O cadastro exige nome, e-mail, senha e endereço brasileiro. A confirmação e a recuperação de senha são enviadas ao Mailpit local; no perfil confirmado, o cliente pode alterar o nome e manter vários endereços.

O catálogo local possui dados de demonstração em `supabase/seed.sql`, separados das migrations e destinados somente ao banco local. Para inserir os exemplos sem apagar usuários/dados existentes, execute `npx supabase db query --file supabase/seed.sql` no diretório do projeto. O arquivo não deve ser aplicado em produção. Imagens nesta etapa usam caminhos locais em `public/products`; upload e hospedagem permanecem pendentes da decisão de armazenamento.

Arquivos `.env` são ignorados pelo Git. Chaves locais servem apenas para desenvolvimento e não devem ser reutilizadas em hospedagem.

O backup acadêmico/local está documentado em [`docs/operations/backup-restore.md`](docs/operations/backup-restore.md); `supabase/backup-local.sh` exige destino protegido fora do repositório. A automação em produção aguarda a definição de hospedagem.

### Defaults de negócio do MVP

Parâmetros aprovados pelo usuário para a primeira versão:

| Decisão | Default |
|---|---|
| Retenção de estoque | 15 minutos; liberação idempotente após recusa/expiração |
| Frete por pedido | Sudeste R$ 15; Sul R$ 20; Centro-Oeste R$ 25; Nordeste R$ 30; Norte R$ 40 |
| Pós-venda | Arrependimento em até 7 dias corridos do recebimento; troca voluntária em até 30 dias; processamento administrativo |
| Promoções | Sem teto de uso e sem acúmulo; maior desconto efetivo, empate pelo início mais recente |
| Relatório | Data de aprovação; pedidos aprovados não cancelados; produtos líquidos de desconto; frete separado |
| Backup acadêmico | Dump PostgreSQL diário, manter 7 arquivos fora do repositório, ensaio de restauração antes da entrega; viewports QA: 375×812, 768×1024 e 1440×900 |
| Autenticação | Supabase Auth; Mailpit local para mensagens de confirmação/recuperação |

O art. 49 do CDC prevê o direito de arrependimento em contratação fora do estabelecimento, e o Decreto 7.962/2013 exige meios claros e eficazes para seu exercício. A administração registra/processa o pedido, sem poder discricionário para negar o prazo legal: [CDC](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm), [Decreto 7.962/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm).

## Rastreabilidade

| Casos de uso | Requisitos | Regras |
|---|---|---|
| UC-001 | RF-001, RF-002 | RN-002 |
| UC-002 | RF-003, RF-004 | RN-001, RN-003 |
| UC-003 | RF-005, RF-008 | RN-003, RN-004 |
| UC-004 | RF-006, RF-007, RF-008, RF-009 | RN-002, RN-004, RN-005, RN-006, RN-007 |
| UC-005 | RF-010 | RN-012 |
| UC-006 | RF-011, RF-013 | RN-010 |
| UC-007 | RF-012 | RN-003, RN-011 |
| UC-008 | RF-013 | RN-011 |
| UC-009 | RF-014 | RN-008, RN-011 |
| UC-010 | RF-015 | RN-009 |
| UC-011 | RF-016 | RN-013 |

## Artefatos de planejamento

- [`TASKS.md`](TASKS.md): backlog de execução sequencial, com estados e pré-requisitos atualizados.
- [`AGENTS.md`](AGENTS.md): contrato operacional para agente de codificação.
- [`docs/adr/ADR-001-layered-architecture.md`](docs/adr/ADR-001-layered-architecture.md): decisão arquitetural inicial.
- [`docs/adr/ADR-002-stack.md`](docs/adr/ADR-002-stack.md): stack selecionada pelo usuário.

