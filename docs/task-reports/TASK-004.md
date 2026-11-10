# Relatório — TASK-004

- **Tarefa:** Implementar autenticação, confirmação e recuperação.
- **Estado:** DONE em 2026-11-09; usuário confirmou que cadastro, confirmação, login, endereços e redefinição de senha funcionam.
- **Dependência:** TASK-002 DONE; Supabase Auth e Mailpit local disponíveis.
- **Branch:** `codex/task-003-local-supabase`. A tentativa de criar `codex/task-004-auth` falhou porque o workspace negou escrita em `.git`; nenhum histórico foi alterado.

## Implementado

- Cadastro com nome, e-mail, senha e endereço brasileiro inicial.
- Confirmação obrigatória do e-mail via Supabase Auth; mensagens locais capturadas pelo Mailpit.
- Login, recuperação de senha com mensagem que não revela se o e-mail existe e formulário para definir nova senha.
- Perfil com alteração de nome e CRUD de múltiplos endereços.
- Migration cria perfis/endereço, cria o primeiro perfil/endereço durante o cadastro, valida campos no banco e ativa RLS com isolamento por `auth.uid()`.
- Perfil não pode ser criado/alterado para administrador pelo cliente: criação é feita pelo trigger de Auth, e a permissão de update do cliente se limita ao nome.
- Configuração Auth local exige confirmação de e-mail e permite redirects para o Vite em `localhost:5173` e `127.0.0.1:5173`.
- Interface responsiva, rótulos de formulário e mensagens acessíveis; sem dependências externas novas.

## Validações executadas

- `npm run build` — passou após as mudanças da TASK-004.
- `npm run lint` — passou após corrigir um efeito React identificado na primeira execução.
- `git diff --check` — passou, com apenas avisos preexistentes de normalização LF/CRLF.
- Usuário executou `npx supabase migration up --local` no WSL — saída mostrou `Applying migration 20261109000000_identity_profiles_addresses.sql...` e `Local database is up to date`.
- O agente não consegue chamar a API/Mailpit local pelo sandbox: tentativas a `127.0.0.1:54321` e `:54324` são negadas por permissões de socket; o controle do navegador também foi interrompido por não conseguir determinar a URL atual com segurança.
- O usuário mediu Vite `HTTP 000` via `127.0.0.1:5173` no WSL e `HTTP 200` via Windows; os links estavam retornando a `127.0.0.1`, que falhou no navegador Windows. O código passou a fixar redirects de desenvolvimento em `http://localhost:5173`; `site_url` local também foi alinhado a `localhost`. Após reiniciar o Supabase, o usuário testou um novo link e confirmou que a redefinição funcionou.
- Após o ajuste do redirect: `npm run build` e `npm run lint` passaram; `git diff --check` passou com avisos LF/CRLF.
- `.env.local` usa somente a URL local e a chave Publishable; Git confirma que o arquivo é ignorado. A chave Secret não foi gravada.

Nenhum segredo foi adicionado a arquivos versionáveis. Nenhum commit foi criado.
