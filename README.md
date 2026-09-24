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
- Verificar disponibilidade antes de seguir ao pagamento. Reter temporariamente as unidades necessárias durante o pagamento, inclusive a última unidade, para impedir concorrência. Após aprovação, confirmar a reserva/venda; recusa ou expiração libera a quantidade. A duração da retenção está pendente.
- Simular pagamento aprovado ou recusado pela escolha do cliente. Em recusa, exibir o motivo.
- Mostrar histórico e atualizações do pedido dentro da conta. Estados principais: pedido realizado, pagamento aprovado, em preparação, enviado, entregue, pagamento recusado e pedido cancelado.
- Permitir solicitações de cancelamento, troca ou devolução dentro de regras e prazos a definir; administrador analisa e decide.

### Operação da loja

- Administradores criam, editam e excluem produtos, categorias, tamanhos, cores e estoque; consultam e atualizam pedidos; gerenciam usuários; moderam avaliações; consultam relatórios de vendas.
- Criar promoções com data de início e término aplicadas a produtos. Limite de uso e regras adicionais permanecem pendentes; acúmulo de descontos está fora do escopo inicial.
- Administradores têm permissões iguais. A primeira conta administrativa é criada no cadastro inicial do projeto.

### Avaliações

- Somente cliente com compra do produto pode avaliá-lo.
- Uma avaliação por cliente e produto, com nota e comentário; administrador pode moderar ou ocultar.

## Requisitos funcionais

| ID | Requisito | Critério de aceitação resumido |
|---|---|---|
| RF-001 | Criar conta, confirmar e-mail, autenticar e recuperar senha | Conta usa nome, e-mail e senha; e-mail precisa ser confirmado para habilitar a compra. |
| RF-002 | Gerenciar perfil e endereços | Cliente edita dados e mantém vários endereços. |
| RF-003 | Descobrir produtos | Categorias, busca por nome e filtros por tamanho, cor, preço e categoria retornam produtos correspondentes. |
| RF-004 | Consultar produto e variações | Detalhe exibe descrição, imagens, preço e disponibilidade por tamanho/cor. |
| RF-005 | Gerenciar carrinho | Cliente adiciona, altera quantidade, remove itens e consulta total. |
| RF-006 | Finalizar pedido com conta | Checkout exige autenticação e e-mail confirmado, endereço, frete e confirmação do resumo. |
| RF-007 | Calcular frete por CEP | Checkout calcula frete usando CEP e regra regional aprovada; valores/fórmula são pendentes. |
| RF-008 | Controlar disponibilidade e retenção | Não permite que duas finalizações retenham a mesma unidade; recusa/expiração libera retenção. |
| RF-009 | Simular pagamento | Cliente escolhe aprovação/recusa; recusa apresenta motivo; aprovação confirma pedido e estoque. |
| RF-010 | Consultar pedidos | Cliente vê histórico e estado atual, incluindo os estados aprovados neste documento. |
| RF-011 | Solicitar pós-venda | Cliente solicita cancelamento, troca ou devolução dentro de prazo/regra configurável, a definir. |
| RF-012 | Administrar catálogo e estoque | Administrador gerencia produtos, categorias, variações e quantidades disponíveis. |
| RF-013 | Administrar pedidos e usuários | Administrador consulta pedidos/usuários e atualiza pedidos conforme transições permitidas. |
| RF-014 | Administrar promoções | Administrador cria promoção de produto com início e término; limites/regras pendentes. |
| RF-015 | Avaliar produto comprado | Cliente elegível registra nota e comentário, uma vez por produto; administrador modera/oculta. |
| RF-016 | Consultar relatório de vendas | Administrador consulta relatório de vendas. Métricas e filtros ficam pendentes de definição. |
| RF-017 | Provisionar administradores | Cadastro inicial do projeto cria primeira conta; administradores têm permissões iguais. |

## Requisitos não funcionais

| ID | Requisito verificável |
|---|---|
| RNF-001 | Interface responsiva deve permitir uso nas larguras de celular, tablet e computador definidas nos critérios visuais da implementação. |
| RNF-002 | Senhas devem ser armazenadas com algoritmo de hash de senha apropriado; nunca em texto simples. |
| RNF-003 | A autorização deve impedir clientes de acessar operações administrativas e dados de outros clientes. |
| RNF-004 | Entradas de formulário e regras de domínio devem ser validadas no servidor, além de validações úteis na interface. |
| RNF-005 | Operações concorrentes de estoque devem preservar a invariante de que unidades disponíveis não ficam negativas e não são retidas por mais de um checkout ativo. |
| RNF-006 | Alterações administrativas, transições de pedido e eventos de autenticação relevantes devem gerar registros operacionais/auditáveis sem expor segredos. |
| RNF-007 | Banco de dados deve preservar integridade referencial e consistência das alterações de pedido, pagamento e estoque. |
| RNF-008 | Backup periódico e procedimento de restauração devem ser definidos antes da implantação; frequência e retenção estão pendentes. |
| RNF-009 | Falhas devem ser registradas para diagnóstico sem expor senhas, tokens ou dados de pagamento em logs. |
| RNF-010 | A implantação deve operar em português e tratar valores monetários em reais e endereços brasileiros; stack e infraestrutura ficam pendentes das orientações acadêmicas. |

## Regras de negócio

- **RN-001:** a loja atende somente clientes/endereço de entrega no Brasil.
- **RN-002:** compra exige conta autenticada e e-mail confirmado.
- **RN-003:** estoque é controlado pela combinação de produto, tamanho e cor.
- **RN-004:** cada checkout precisa obter disponibilidade exclusiva antes de iniciar pagamento; uma unidade não pode ser retida por dois checkouts.
- **RN-005:** a retenção é temporária; duração pendente. Recusa ou expiração libera a quantidade. Aprovação confirma a compra e baixa/reserva definitivamente o estoque.
- **RN-006:** pagamento é simulado e sua decisão de aprovado/recusado é selecionada pelo cliente na demonstração; recusa apresenta motivo.
- **RN-007:** frete depende do CEP, com valor crescente conforme distância relativa à região Sudeste; fórmula e tabela de valores pendentes.
- **RN-008:** cada promoção inicial aplica-se a produto e possui início e fim; limite de uso e outras regras pendentes. Descontos não acumulam no escopo inicial.
- **RN-009:** avaliação requer compra do produto e permite uma avaliação por cliente/produto; contém nota e comentário e pode ser moderada/ocultada.
- **RN-010:** solicitações de cancelamento, troca e devolução são submetidas à análise de administrador; prazos e regras exatas pendentes.
- **RN-011:** administradores têm permissões equivalentes; a conta inicial é criada no provisionamento inicial do sistema.
- **RN-012:** confirmação e acompanhamento são apresentados na conta. E-mail transacional fica para etapa futura.

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
- Políticas finais de troca/devolução, tabela de frete e valores exatos enquanto não aprovados.

## Pendências de decisão

| ID | Pendente | Impacto / próximo responsável |
|---|---|---|
| PD-001 | Stack e restrições da faculdade | Define estrutura, ferramentas e forma de execução; confirmar com professor. |
| PD-002 | Duração e processo de expiração da retenção de estoque | Define experiência de checkout e mecanismo de expiração. |
| PD-003 | Fórmula, regiões e valores de frete por CEP | Define cálculo de checkout e testes de preço. |
| PD-004 | Prazos e condições para cancelamento, troca e devolução | Define elegibilidade e transições de pedido. |
| PD-005 | Limite de uso de promoções | Define validação no checkout e administração. |
| PD-006 | Métricas e filtros do relatório de vendas | Define consultas administrativas. |
| PD-007 | Métricas operacionais, retenção de logs/backups e recuperação | Necessário para operação/implantação; frequência e retenção a acordar. |
| PD-008 | Fluxo de recuperação de senha e entrega de e-mail de confirmação no ambiente acadêmico | Funcionalidade requerida; mecanismo/canal de demonstração a decidir após stack. |

## Arquitetura proposta

Adotar inicialmente uma aplicação organizada em camadas, conforme o enunciado acadêmico: interface/apresentação, aplicação/casos de uso, domínio/regras e persistência/integrações. A arquitetura não presume linguagem, framework ou banco. O checkout deve tratar verificação/retensão, resultado simulado e confirmação/liberação como operações consistentes e protegidas contra concorrência. Detalhamento: [`docs/architecture/overview.md`](docs/architecture/overview.md), [`docs/diagrams/architecture.mmd`](docs/diagrams/architecture.mmd) e [`docs/diagrams/order-flow.mmd`](docs/diagrams/order-flow.mmd).

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
| UC-011 | RF-016 | RN-011 |

## Artefatos de planejamento

- [`TASKS.md`](TASKS.md): backlog dependente de decisões e plano de implementação futuro; todas as tarefas começam `BLOCKED` até resolver pré-requisitos.
- [`AGENTS.md`](AGENTS.md): contrato operacional para agente de codificação.
- [`docs/adr/ADR-001-layered-architecture.md`](docs/adr/ADR-001-layered-architecture.md): decisão arquitetural inicial.

