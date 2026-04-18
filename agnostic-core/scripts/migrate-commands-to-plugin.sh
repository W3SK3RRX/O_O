#!/bin/bash
# agnostic-core - commands/workflows/*.md -> commands-plugin/*.md
# Adiciona frontmatter name + description para slash commands.
# Ignora indices (COMMANDS.md) e catalogos (scripts.md).

set -e

DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/commands/workflows"
DEST="$REPO_ROOT/commands-plugin"

[ ! -d "$SRC" ] && { echo "ERRO: $SRC nao encontrado"; exit 1; }

declare -A DESC
DESC[brainstorm]='Explorar opcoes e tomar decisoes informadas antes de implementar. Use ao iniciar feature nova quando ainda nao ha consenso sobre a abordagem.'
DESC[create]='Criar nova aplicacao ou feature completa do zero com escopo, stack, estrutura e primeiros arquivos.'
DESC[debug]='Investigacao sistematica de bugs em 4 fases: reproduzir, isolar, entender causa raiz, corrigir.'
DESC[deploy]='Processo de deploy seguro e verificavel: checklist pre-deploy, execucao, validacao pos-deploy, rollback.'

migrated=0
skipped=0

for f in "$SRC"/*.md; do
  [ -f "$f" ] || continue
  name=$(basename "$f" .md)
  dest="$DEST/$name.md"

  if [ -f "$dest" ]; then
    echo "  [SKIP] $name (ja existe)"
    skipped=$((skipped+1))
    continue
  fi

  if $DRY_RUN; then
    echo "  [DRY]  workflows/$(basename "$f") -> commands-plugin/$name.md"
    continue
  fi

  desc="${DESC[$name]:-Workflow $name do agnostic-core}"
  body=$(awk 'BEGIN{fm=0; in_body=0} /^---$/{fm++; if(fm==2){in_body=1; next}} in_body{print}' "$f")
  [ -z "$body" ] && body=$(cat "$f")

  mkdir -p "$DEST"
  {
    echo "---"
    echo "name: $name"
    echo "description: $desc"
    echo "---"
    echo ""
    echo "$body"
  } > "$dest"

  echo "  [OK]   commands-plugin/$name.md"
  migrated=$((migrated+1))
done

echo ""
echo "Migrados: $migrated | Pulados: $skipped"
$DRY_RUN && echo "(dry-run - nenhum arquivo escrito)"
