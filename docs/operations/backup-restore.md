# Backup e restauração local

## Escopo e proteção

Este procedimento cobre o Supabase local para fins acadêmicos: um backup lógico diário, retenção dos sete arquivos mais recentes e restauração de ensaio antes da entrega. A automação de produção permanece pendente até a escolha de hospedagem (PD-007). O dump inclui o schema `auth` e pode conter e-mails, perfis, endereços e hashes de senha. Armazene-o apenas em diretório pessoal protegido, fora do repositório; não o envie ao Git, e-mail ou armazenamento compartilhado sem autorização.

Por decisão do usuário em 2026-11-10, os dados de `vault.secrets` são excluídos com `--exclude-table-data=vault.secrets`; a definição da tabela/schema permanece. O aplicativo não usa Vault. Esses segredos internos não serão recuperáveis desse backup e precisam ser recriados por configuração separada se vierem a ser usados. O restante dos schemas e dados, incluindo `auth`, permanece incluído.

## Criar backup

1. Inicie o stack local e confirme `supabase_db_loja-online` saudável com `docker ps`.
2. Crie/identifique um diretório de backup protegido fora da pasta do projeto. Exemplo no WSL: `mkdir -p "$HOME/backups/loja-online" && chmod 700 "$HOME/backups/loja-online"`.
3. Na raiz do projeto, execute `bash supabase/backup-local.sh "$HOME/backups/loja-online"`.
4. Confira a mensagem de conclusão, tamanho maior que zero e permissão `600`. O script aborta sem destino absoluto existente, se o container estiver parado, ou se o caminho estiver no repositório. O arquivo parcial é removido em falhas. São removidos apenas dumps deste projeto além dos sete mais recentes no diretório escolhido.
5. Execute diariamente enquanto o stack local for usado. O projeto não instala agendador; agendamento no host/produção depende do ambiente e permanece pendente.

## Ensaio de restauração isolado

Não restaure sobre o banco ativo do projeto. Para teste, use um diretório temporário e um container PostgreSQL isolado, sem portas publicadas e sem volume persistente. O arquivo de backup é um dump no formato custom do `pg_dump`; restaure com `pg_restore --exit-on-error --no-owner --no-privileges --dbname=postgres /backup/loja-online-....dump`. Monte como somente leitura apenas o arquivo escolhido e use uma imagem PostgreSQL compatível com a major version indicada em `supabase/config.toml` (`17`).

Antes de encerrar o ensaio, compare no banco original e no restaurado as contagens de tabelas e registros essenciais (`auth.users`, `profiles`, `addresses`, `products`, `product_variants`, `orders`, `order_items`, `inventory_reservations`, `simulated_payments`, `promotions`, `reviews`, `after_sales_requests`) e confira que funções, triggers e políticas de RLS estão presentes. Guarde apenas o resultado da reconciliação, sem dados pessoais. Encerre e remova exclusivamente o container temporário identificado e seu volume temporário, depois de confirmar o nome; nunca rode `supabase db reset` no projeto em uso para este ensaio.

## Recuperação do projeto local

Para um projeto local recriado a partir do código, prefira `npx supabase start` e `npx supabase migration up` para reconstruir schema a partir de migrations; aplique `supabase/seed.sql` somente se desejar dados de demonstração. Para restaurar os dados de um dump integral, siga o ensaio isolado primeiro e direcione a restauração somente ao banco de recuperação confirmado. A restauração pode substituir dados existentes e não é uma operação de rotina no banco ativo.

## Evidência operacional

Registre data, identificador do arquivo (não seu conteúdo), tamanho, permissão, retorno do `pg_restore` e resultado de reconciliação. Não registre connection strings, chaves, tokens, hashes ou linhas de dados pessoais.
