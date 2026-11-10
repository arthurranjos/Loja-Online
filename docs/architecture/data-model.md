# Modelo de dados lógico — MVP

Modelo relacional em PostgreSQL/Supabase. `auth.users` é a identidade de origem; tabelas de domínio referenciam seu UUID. Por decisão do usuário, todos os valores monetários são armazenados e trafegados como centavos inteiros (`bigint` no PostgreSQL); a interface os formata em reais. Quantidades de estoque são inteiras e não negativas.

## Entidades e relações

| Tabela | Campos centrais e restrições |
|---|---|
| `profiles` | `id` PK/FK para `auth.users`; nome; papel `customer/admin`; timestamps. Papel não pode ser alterado pelo cliente. |
| `addresses` | `id`; `user_id`; destinatário; CEP; logradouro, número, complemento, bairro, cidade, UF de duas letras; `is_default`. UF determina região pela tabela brasileira. |
| `categories` | `id`; nome único; slug único; ativo. |
| `products` | `id`; `category_id`; nome, slug, descrição, preço em centavos (`price_cents`), ativo; timestamps. |
| `product_variants` | `id`; `product_id`; tamanho, cor, SKU único; `stock_on_hand >= 0`; ativo; unique (`product_id`,`size`,`color`). Estoque pertence à variação. A leitura pública recebe somente disponibilidade booleana, não a contagem. |
| `product_images` | `id`; `product_id`; caminho local sob `/products/`, texto alternativo, posição. Upload e hospedagem continuam pendentes; nenhuma Storage externa foi escolhida. |
| `promotions` | `id`; produto; tipo percentual/valor fixo; valor positivo; `starts_at < ends_at`; ativo. Sem teto de uso e sem acumulação. Promoção simultânea usa o maior desconto efetivo; empate usa o início mais recente (PD-005 resolvida); desconto limitado ao preço do produto. |
| `carts` | `id`; `user_id` unique; timestamps. RLS permite ao cliente ler apenas o próprio carrinho; criação/edição ocorre por RPC autenticada. |
| `cart_items` | `cart_id`; `variant_id`; `quantity > 0`; PK composta. RLS limita leitura ao dono; RPCs autenticadas controlam inserção, alteração e remoção. Carrinho não reserva estoque. |
| `orders` | `id`; `user_id`; `cart_id`; `shipping_address_id` opcional e snapshot JSON do endereço; `status`; subtotal/desconto/frete/total em centavos; `payment_approved_at`; `cancelled_at`; timestamps. Total satisfaz subtotal − desconto + frete. |
| `order_items` | `id`; `order_id`; `variant_id`; `promotion_id` opcional; quantidade positiva; snapshot de nome/SKU/tamanho/cor; preço unitário de tabela, desconto total da linha em centavos e promoção aplicada. Valores são congelados ao iniciar o checkout. |
| `inventory_reservations` | `id`; `order_id`; `variant_id`; `quantity > 0`; estado `active/consumed/released/expired`; `expires_at`; timestamps. Índice por variação/expiração e unicidade por pedido/variação. Só reservas ativas com `expires_at > now()` contam contra disponibilidade. |
| `simulated_payments` | `id`; `order_id` unique; resultado `approved/declined`; motivo em recusa; `processed_at`; chave de idempotência única derivada do pedido. Sem dados de cartão. |
| `order_status_history` | `id`; `order_id`; status anterior/novo; ator; data; motivo sem dados sensíveis. Escrita somente pelas RPCs transacionais; cliente pode ler o próprio histórico. |
| `after_sales_requests` | `id`; `order_id`; `user_id`; tipo (`cancellation/regret/exchange`); motivo; estado `submitted/processing/approved/rejected/completed`; timestamps; decisão e ator admin. Arrependimento legal não pode ser negado; troca voluntária pode ser analisada pelo admin. Frete de retorno é pago pela loja; devolução/troca só repõe estoque após recebimento e conferência. Cancelamento pré-envio repõe imediatamente quando aprovado. |
| `after_sales_request_items` | `request_id`; `order_item_id`; quantidade solicitada entre 1 e saldo ainda não devolvido/trocado; para troca, `replacement_variant_id` da mesma peça com tamanho/cor escolhidos. Checagem de disponibilidade no envio e na aprovação; a baixa/reposição efetiva ocorre atomicamente na conclusão após recebimento/conferência. |
| `reviews` | `id`; `user_id`; `product_id`; nota 1–5; comentário; estado `visible/hidden` (nova avaliação inicia `hidden`); moderador e data; unique (`user_id`,`product_id`). Elegibilidade comprovada por pedido entregue com item correspondente. Só avaliações `visible` são públicas. |
| `audit_events` | `id`; ator; ação; entidade/ID; timestamp; metadados permitidos, sem segredo/token ou dado de cartão. Escrita controlada. |

## Autorização e RLS

- Ativar RLS em toda tabela acessível pela API e também restringir grants.
- Perfil/endereço/carrinho/pedido/solicitação/avaliação: `auth.uid()` deve corresponder ao dono. Política administrativa consulta papel em dado protegido/função mínima, nunca em metadata editável pelo usuário.
- Catálogo ativo e avaliações visíveis podem ser lidos anonimamente. Escritas administrativas exigem papel admin validado no banco.
- RPCs sensíveis validam identidade, autorização, estado atual e entradas. `service_role` fica apenas em ambiente servidor/operacional, nunca no bundle React.
- Primeira conta admin deve ser provisionada por migration/seed local confiável ou operação administrativa única; não existe endpoint público de autoelevação.

## Limites transacionais

Checkout usa operação PostgreSQL transacional (RPC): valida usuário confirmado, endereço, preço vigente e quantidades; bloqueia linhas de produto/variação em ordem determinística; verifica disponibilidade; cria pedido/itens com snapshots e reservas de 15 minutos. Repetir a solicitação para um carrinho com pedido/reserva ainda ativa retoma o mesmo pedido. Reserva não reduz `stock_on_hand`: disponibilidade é estoque atual menos reservas ativas não vencidas. Qualquer falha reverte o conjunto. Na disputa pela última unidade, no máximo uma reserva fica ativa.

Confirmação do pagamento simulado é outra operação transacional e idempotente: valida dono, chave de idempotência, estado da reserva e `expires_at`; aprovação consome a reserva e baixa estoque uma única vez e marca pedido aprovado; recusa registra motivo, libera reserva e atualiza estado. Expiração libera unidades uma vez. Aprovação tardia após expiração é recusada, sem baixa. Cancelamento pós-aprovação exige fluxo autorizado e política de reposição definida em TASK-008/PD-002.

Não chamar serviço externo dentro da transação. Servidor/banco não confia em preço, desconto, frete, total ou status enviados pelo browser; recalcula ou valida. Promoções são consultadas na janela de preço do checkout; valores e promoção aplicada ficam registrados no pedido. A implementação e testes de concorrência pertencem às TASKs funcionais.

## Pendências explícitas

- PD-001: restrições finais da faculdade, versão/pacote e formato de entrega.
- PD-003: consulta automática de CEP não está incluída; CEP e UF vêm do endereço.
- PD-004/PD-009: condições operacionais de troca, defeito/garantia e efeitos de estorno real.
- PD-005: resolvida pelo usuário; maior desconto efetivo, empate pelo início mais recente.
- PD-007: resolvida para backup local/escopo acadêmico (export diário, 7 dias fora do repositório e restauração ensaiada); automação em produção aguarda a escolha de hospedagem.
- PD-008: SMTP para projeto hospedado.

## Relatório de vendas (TASK-014)

O filtro usa datas de calendário em `America/Sao_Paulo`: o início é inclusivo à meia-noite da data inicial e o limite final é exclusivo à meia-noite do dia seguinte à data final. Só entram pedidos com pagamento simulado aprovado e estado diferente de `pedido_cancelado`. Produtos são somados como subtotal menos desconto; frete é totalizado à parte.

## Carrinho e frete (TASK-006)

O carrinho guarda a variação e quantidade sem congelar preço nem reservar estoque. O resumo consulta preço vigente do catálogo e soma em centavos inteiros. O frete é calculado no banco por RPC autenticada usando CEP validado e UF do endereço pertencente ao cliente, conforme tarifas fixas de RN-007. O checkout recalcula preços e descontos vigentes, grava snapshots e aplica frete ao valor líquido dos produtos.
