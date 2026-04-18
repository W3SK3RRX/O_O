#!/bin/bash
# agnostic-core - Flatten agents/ -> agents-plugin/
# Plugin spec exige agents em agents/*.md (flat). Copia preservando frontmatter.

set -e

DRY_RUN=false
[[ "$1" == "--dry-run" ]] && DRY_RUN=true

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/agents"
DEST="$REPO_ROOT/agents-plugin"

[ ! -d "$SRC" ] && { echo "ERRO: $SRC nao encontrado"; exit 1; }

# Deteccao de colisao de nomes
dupes=$(find "$SRC" -name '*.md' -type f -exec basename {} \; | sort | uniq -d)
if [ -n "$dupes" ]; then
  echo "ERRO: nomes duplicados:" >&2
  echo "$dupes" >&2
  exit 1
fi

migrated=0
skipped=0

while IFS= read -r f; do
  name=$(basename "$f")
  rel="${f#$SRC/}"
  dest="$DEST/$name"

  if [ -f "$dest" ]; then
    echo "  [SKIP] $name (ja existe)"
    skipped=$((skipped+1))
    continue
  fi

  if $DRY_RUN; then
    echo "  [DRY]  $rel -> agents-plugin/$name"
    continue
  fi

  mkdir -p "$DEST"
  cp "$f" "$dest"
  echo "  [OK]   $rel -> agents-plugin/$name"
  migrated=$((migrated+1))
done < <(find "$SRC" -name '*.md' -type f | sort)

echo ""
echo "Migrados: $migrated | Pulados: $skipped"
$DRY_RUN && echo "(dry-run - nenhum arquivo escrito)"
