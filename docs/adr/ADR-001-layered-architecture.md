# ADR-001: Arquitetura em camadas

- **Status:** Aceita para planejamento inicial
- **Data:** 2026-09-24
- **Rastreabilidade:** descrição acadêmica do projeto; RF-001–RF-017; RNF-003–RNF-007

## Contexto

O trabalho determina uma arquitetura em camadas para separar responsabilidades e facilitar manutenção e evolução. A stack ainda depende das orientações da faculdade (PD-001). O sistema inclui catálogo, autenticação, administração e um checkout que precisa manter consistentes estoque concorrente, pagamento simulado e pedido.

## Decisão

Organizar a solução em camadas de apresentação, aplicação/casos de uso, domínio e persistência/integrações. As regras de negócio e invariantes ficam no domínio/aplicação, sem depender da interface. Persistência e pagamento simulado são acessados por contratos explícitos. O checkout coordena retenção temporária, resultado do pagamento e confirmação ou liberação do estoque.

Esta decisão não escolhe framework, linguagem, banco, protocolo de API ou provedor. Esses pontos ficam condicionados a PD-001 e ADRs posteriores, se forem decisões arquiteturais relevantes.

## Alternativas consideradas

1. **Monólito em camadas:** atende ao escopo acadêmico e permite transações locais simples; escolhido como forma lógica inicial, sem definir implantação.
2. **Microserviços:** separação operacional e transacional aumenta complexidade e não tem requisito que a justifique no escopo atual.
3. **Aplicação sem separação explícita:** menor estrutura inicial, mas mistura regras, interface e persistência, contrariando a orientação do trabalho e dificultando a integridade do checkout.

## Consequências

- Regras centrais podem ser validadas sem depender da interface.
- O mecanismo de persistência deve suportar operação atômica/concor­rente para retenção de estoque.
- A solução deve manter fronteiras suficientes sem criar abstrações desnecessárias.
- Decisões de stack, deployment e mecanismo de expiração permanecem pendentes.
- Se a faculdade exigir arquitetura incompatível, revisar este ADR com nova evidência e preservar histórico.
