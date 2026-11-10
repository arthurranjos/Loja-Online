# ADR-002: Stack de aplicação React e Supabase

- **Status:** Aceita pelo usuário
- **Data:** 2026-11-05
- **Decisor/evidência:** instrução direta do usuário nesta tarefa: “banco de dados use supabase, fremework react”; confirmação posterior para a proposta React + TypeScript + Vite com Supabase.
- **Rastreabilidade:** TASK-001, PD-001, RF-001–RF-017, RNF-001–RNF-010

## Contexto

O trabalho pede aplicação em camadas, banco de dados, autenticação, controle de acesso e interface responsiva. A escolha anterior estava pendente. O usuário autorizou executar as TASKs e definiu React para a interface e Supabase para o banco. Para concretizar a proposta de stack, também confirmou React com TypeScript e Vite.

## Decisão

- **Interface:** React com TypeScript.
- **Ferramenta de desenvolvimento/build da aplicação web:** Vite.
- **Persistência:** Supabase, baseado em PostgreSQL.
- **Acesso:** cliente oficial `supabase-js` a partir da aplicação onde adequado; regras de autorização e Row Level Security (RLS) devem ser projetadas e verificadas antes de expor tabelas. Operações que dependem de transação/invariantes de estoque deverão ficar no banco, em operações atômicas (por exemplo, função SQL/RPC), nunca ser simuladas como transação no cliente.

Supabase Auth será usado para identidade, confirmação de e-mail e recuperação de senha. No desenvolvimento local, mensagens serão capturadas pelo Mailpit; envio hospedado depende de SMTP configurado no projeto. **npm** é o gerenciador de pacotes do repositório, usando lockfile para builds reproduzíveis; foi escolhido por já acompanhar o Node disponível e permitir incluir a Supabase CLI como devDependency. O runtime local verificado é Node.js 24.13.0; `engines` exige Node 22.12+ para compatibilidade com Vite atual. A versão final deve ser conferida com exigências acadêmicas (PD-001). Armazenamento de imagens e hospedagem permanecem pendentes. Nenhuma chave secreta ou service-role key pode entrar no frontend.

## Alternativas consideradas

1. React + TypeScript + Vite e Supabase/PostgreSQL — escolhido por decisão do usuário; atende a interface React solicitada e fornece PostgreSQL como armazenamento relacional gerenciado.
2. Outra biblioteca/framework de interface ou outro banco — descartado porque conflita com a escolha explícita atual; pode ser reconsiderado somente se uma restrição acadêmica obrigatória for apresentada.

## Consequências

- Os componentes de interface e contratos devem usar TypeScript e a estrutura Vite documentada.
- Dependências npm devem ser reproduzidas a partir de `package-lock.json`; não instalar Supabase CLI globalmente.
- O modelo de dados, RLS, migrations e operações atômicas precisam ser detalhados em TASK-002.
- Desenvolvimento e validação acadêmica devem priorizar Supabase local para evitar credenciais hospedadas; exige Supabase CLI e runtime Docker.
- Credenciais só por ambiente local seguro; arquivos `.env` reais devem ser ignorados pelo Git e nunca publicados.
- Se o professor exigir stack incompatível, interromper e registrar decisão/revisão deste ADR antes de mudar tecnologias.

## Referências oficiais consultadas

- [React: TypeScript](https://react.dev/learn/typescript)
- [Supabase: React quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase: TypeScript support](https://supabase.com/docs/reference/javascript/typescript-support)
- [Supabase: Local development and CLI](https://supabase.com/docs/guides/local-development)
- [Vite: Getting started and Node.js compatibility](https://vite.dev/guide/)
