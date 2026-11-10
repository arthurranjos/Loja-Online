#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 1 ]]; then
  echo "Uso: bash supabase/backup-local.sh /caminho/absoluto/fora-do-repositorio" >&2
  exit 2
fi

destination="$1"
if [[ "$destination" != /* ]]; then
  echo "O destino deve ser um caminho absoluto no WSL." >&2
  exit 2
fi
if [[ ! -d "$destination" ]]; then
  echo "O diretório de destino deve existir e estar em armazenamento protegido." >&2
  exit 2
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
destination_real="$(cd "$destination" && pwd -P)"
case "$destination_real/" in
  "$repo_root/"*) echo "Recusado: backups não podem ser gravados dentro do repositório." >&2; exit 2 ;;
esac

container="supabase_db_loja-online"
if ! docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null | grep -qx true; then
  echo "O container local $container não está em execução." >&2
  exit 1
fi

umask 077
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup="$destination_real/loja-online-$timestamp.dump"
temporary="$backup.partial"
cleanup() { rm -f -- "$temporary"; }
trap cleanup EXIT

# Custom format includes auth; Vault secrets are intentionally omitted because
# the local postgres role cannot restore that extension-owned data and the app
# does not use it. The vault schema/table definitions remain in the dump.
docker exec "$container" pg_dump --format=custom --no-owner --no-privileges \
  --exclude-table-data=vault.secrets --username=postgres --dbname=postgres > "$temporary"
test -s "$temporary"
chmod 600 "$temporary"
mv -- "$temporary" "$backup"
trap - EXIT

# Retain the newest seven successful daily dumps matching this project's prefix.
mapfile -t old_backups < <(find "$destination_real" -maxdepth 1 -type f -name 'loja-online-*.dump' -printf '%T@ %p\n' | sort -rn | tail -n +8 | cut -d' ' -f2-)
if ((${#old_backups[@]})); then rm -f -- "${old_backups[@]}"; fi

echo "Backup local concluído: $backup"
echo "Tamanho: $(stat -c '%s bytes' "$backup")"
echo "Permissões: $(stat -c '%a' "$backup")"
