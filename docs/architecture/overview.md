# Visão geral da arquitetura

## Direção

Aplicação web responsiva organizada em camadas. A arquitetura é lógica; nenhuma stack foi escolhida enquanto PD-001 estiver pendente.

| Camada | Responsabilidade | Exemplos do domínio |
|---|---|---|
| Apresentação | Interface responsiva, formulários, navegação e área administrativa | Catálogo, carrinho, conta, painel |
| Aplicação | Orquestrar casos de uso, autorização e transações de fluxo | Finalizar compra, moderar avaliação, atualizar pedido |
| Domínio | Regras, estados e invariantes independentes de interface | Variação, retenção, pedido, promoção, avaliação |
| Persistência e integrações | Armazenar dados e implementar contratos externos | Banco, serviço de e-mail acadêmico a decidir, pagamento simulado |

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
4. Retenção tem expiração (duração PD-002). Recusa e expiração liberam quantidade; aprovação confirma uma única baixa/reserva final.
5. Repetição de notificação/ação de pagamento não duplica pedido nem altera estoque mais de uma vez.
6. Cliente só acessa seus próprios dados/pedidos; operação administrativa exige autorização.
7. Avaliação requer compra do produto e unicidade cliente/produto.
8. Frete e promoção registrados no pedido devem refletir as regras vigentes no instante de finalização.

## Fluxo de checkout

1. Cliente autenticado e confirmado revisa carrinho, endereço e cálculo de frete por CEP.
2. Sistema valida preços, quantidades e disponibilidade; obtém retenção exclusiva com expiração ainda pendente.
3. Cliente escolhe resultado de pagamento simulado.
4. Em aprovação, pedido e baixa final são confirmados consistentemente e cliente vê o status na conta.
5. Em recusa, sistema informa motivo, registra pagamento recusado e libera retenção.
6. Se a retenção expirar antes da confirmação, libera estoque e impede a aprovação tardia de consumir unidade não mais retida; comportamento de pedido atrasado precisa ser coberto no desenho de TASK-007/008.

## Segurança e operação

- Hash de senha apropriado, autorização no servidor e validação de entrada.
- Logs sem segredos; trilha para alterações administrativas e transições relevantes.
- Backup e restauração periódicos; frequência, retenção e ambiente de implantação dependem de PD-007/PD-001.
- Confirmação/recuperação de e-mail são requisitos; mecanismo para demonstração acadêmica depende de PD-008.

## Pontos que exigem decisão antes de implementação

Consultar PD-001 a PD-008 no README. Nenhum valor de frete, duração de retenção ou política de devolução pode ser presumido pelo agente.
