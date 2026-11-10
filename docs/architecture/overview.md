# Visão geral da arquitetura

## Direção

Aplicação web responsiva organizada em camadas. Stack escolhida em ADR-002: React + TypeScript + Vite no frontend e Supabase/PostgreSQL para persistência e Auth. Desenvolvimento local usa Supabase CLI, Docker e Mailpit; hospedagem e Storage seguem pendentes.

| Camada | Responsabilidade | Exemplos do domínio |
|---|---|---|
| Apresentação | Interface responsiva, formulários, navegação e área administrativa | Catálogo, carrinho, conta, painel |
| Aplicação | Orquestrar casos de uso, autorização e transações de fluxo | Finalizar compra, moderar avaliação, atualizar pedido |
| Domínio | Regras, estados e invariantes independentes de interface | Variação, retenção, pedido, promoção, avaliação |
| Persistência e integrações | Armazenar dados e implementar contratos externos | Supabase/PostgreSQL, Supabase Auth, Mailpit local, pagamento simulado |

O frontend nunca recebe uma chave `service_role`. A autorização sobre dados precisa ser aplicada e verificada no Postgres/Supabase com RLS e privilégios mínimos. Lógica que atualiza estoque, retenções e pedidos de forma atômica deverá ser executada no banco por contrato seguro definido em TASK-002.

## Fronteiras de domínio

- **Identidade e perfil:** conta, confirmação, recuperação e endereços.
- **Catálogo:** produtos, categorias, variações e consulta de disponibilidade.
- **Comércio:** carrinho, CEP/frete, retenção de estoque, pagamento simulado e pedido.
- **Administração:** gestão de catálogo, pedidos, usuários e promoções.
- **Pós-venda e conteúdo:** solicitações, avaliações e moderação.
- **Operação:** auditoria, logs, backup e relatório.

Estas são fronteiras conceituais, não exigência de serviços implantáveis separados.

## Modelo conceitual mínimo

`Cliente` mantém um ou mais `Endereços`. `Produto` pertence a `Categoria` e possui `Variações` identificadas por tamanho e cor; cada variação possui estoque. `Carrinho` agrega itens de variação. `Pedido` registra cliente, endereço, itens e valores congelados no momento da compra; pode ter uma `RetençãoEstoque` temporária e um `PagamentoSimulado`. `Promoção` aplica-se a produto em uma janela. `Avaliação` associa cliente e produto comprado. `SolicitaçãoPósVenda` associa cliente e pedido e aguarda decisão administrativa. Administradores compartilham permissões.

Os campos exatos e chaves são parte de TASK-002 após stack confirmada.

## Invariantes críticas

1. Conta não confirmada não finaliza compra.
2. Estoque pertence a uma variação de produto; disponibilidade nunca é negativa.
3. Uma unidade não pode pertencer a duas retenções ativas. Adquirir retenção deve ser atômico diante de concorrência.
4. Retenção expira após 15 minutos. Recusa e expiração liberam quantidade; aprovação confirma uma única baixa/reserva final.
5. Repetição de notificação/ação de pagamento não duplica pedido nem altera estoque mais de uma vez.
6. Cliente só acessa seus próprios dados/pedidos; operação administrativa exige autorização.
7. Avaliação requer compra do produto e unicidade cliente/produto.
8. Frete e promoção registrados no pedido devem refletir as regras vigentes no instante de finalização.

## Fluxo de checkout

1. Cliente autenticado e confirmado revisa carrinho, endereço e cálculo de frete por CEP.
2. Sistema valida preços, quantidades e disponibilidade; obtém retenção exclusiva por 15 minutos.
3. Cliente escolhe resultado de pagamento simulado.
4. Em aprovação, pedido e baixa final são confirmados consistentemente e cliente vê o status na conta.
5. Em recusa, sistema informa motivo, registra pagamento recusado e libera retenção.
6. Se a retenção expirar antes da confirmação, a tentativa de aprovar é registrada como pagamento recusado com motivo, e a unidade não é baixada. Repetir a decisão retorna o resultado original sem duplicar pagamento ou baixa.

## Segurança e operação

- Hash de senha apropriado, autorização no servidor e validação de entrada.
- Logs sem segredos; trilha para alterações administrativas e transições relevantes.
- Backup lógico diário, com retenção de 7 dias fora do Git e restauração de ensaio antes da entrega; automação hospedada depende do ambiente escolhido.
- Supabase Auth oferece confirmação/recuperação; mensagens locais são capturadas pelo Mailpit. SMTP hospedado permanece em PD-008.

## Pontos que exigem decisão antes de implementação

Consultar PD-001 a PD-009 no README. Parâmetros aprovados estão registrados; pontos pendentes não devem ser inferidos.
