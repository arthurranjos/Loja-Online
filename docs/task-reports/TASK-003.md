# Relatório — TASK-003

- **Tarefa:** Preparar estrutura, execução local e persistência inicial.
- **Estado:** concluída em 2026-11-09.
- **Branch:** `codex/task-003-local-supabase`.

## Entrega

- Esqueleto React + TypeScript + Vite com scripts `dev`, `build`, `lint` e `preview`, dependências registradas em `package-lock.json` e requisito Node.js >=22.12.
- Cliente `supabase-js` configurado para ler URL e chave pública do ambiente Vite. `.env.example` contém apenas placeholder; `.env` real é ignorado pelo Git.
- `supabase/config.toml` preparado para projeto local `loja-online`. Seeds estão desativados e nenhum dado demonstrativo foi adicionado. Serviços opcionais estão desativados nesta etapa.
- README documenta execução no WSL, configuração local, Supabase, Mailpit e encerramento.
- O starter permanece sem funções de negócio, conforme o Scope Guard.

## Validações executadas

- `npx supabase init` — concluiu.
- `npm ci` — concluiu durante a configuração das dependências.
- `npx supabase start` — stack local iniciou e disponibilizou os serviços locais.
- `npx supabase db query --read-only "select 1 as connected;"` — retornou `connected: 1`.
- `npm run build` — passou; Vite gerou o build de produção.
- `npm run lint` — passou sem avisos.
- `npm audit --omit=dev` — na verificação anterior, retornou zero vulnerabilidades de produção.
- `npm audit` completo identificou 7 alertas moderados transitivos de dependência de desenvolvimento (`minimatch` via typescript-eslint). A correção sugerida exigia alteração forçada de versões; nenhuma alteração forçada foi aplicada.
- `git diff --check` — sem erros de whitespace; Git exibiu apenas avisos de conversão LF/CRLF.

## Limitações e notas

- Depois de executar `npx supabase stop`, a checagem final de status pelo WSL retornou `Wsl/E_ACCESSDENIED`. A consulta ao banco e o início do stack haviam sido confirmados antes; não foi possível confirmar o estado dos containers ao final.
- Uma nova verificação local de `npm audit --omit=dev` falhou por falta de acesso DNS ao registry (`ENOTFOUND registry.npmjs.org`). O resultado sem vulnerabilidades de produção refere-se à execução anterior que concluiu.
- O ESLint flat config substitui o Oxlint do scaffold porque a política do Windows bloqueou o binding nativo do Oxlint. `npm run lint` passou com a alternativa configurada.
- Nenhum segredo ou chave gerada localmente foi escrito nos arquivos versionáveis deste relatório ou do projeto.
- Não foi criado commit.
