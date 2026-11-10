#!/usr/bin/env bash
set -euo pipefail

db_container='supabase_db_loja-online'
validation_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
temporary_dir="$(mktemp -d)"

run_sql() {
  docker exec -i "$db_container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$1"
}

cleanup() {
  docker exec -i "$db_container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$validation_dir/task-007-cleanup.sql" >/dev/null 2>&1 || true
  rm -rf "$temporary_dir"
}
trap cleanup EXIT

docker inspect "$db_container" >/dev/null
run_sql "$validation_dir/task-007-setup.sql"

docker exec -i "$db_container" psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  < "$validation_dir/task-007-session-a.sql" > "$temporary_dir/session-a.log" 2>&1 &
session_a_pid=$!
sleep 1
run_sql "$validation_dir/task-007-session-b.sql" > "$temporary_dir/session-b.log" 2>&1
wait "$session_a_pid"

cat "$temporary_dir/session-a.log"
cat "$temporary_dir/session-b.log"
if ! grep -q 'PASS: a segunda sessão foi recusada' "$temporary_dir/session-b.log"; then
  printf '%s\n' 'FALHA: a validação concorrente não confirmou a recusa da segunda sessão.' >&2
  exit 1
fi

run_sql "$validation_dir/task-007-transitions.sql"
printf '%s\n' 'PASS: validação TASK-007 concluída; fixtures locais serão removidos.'
