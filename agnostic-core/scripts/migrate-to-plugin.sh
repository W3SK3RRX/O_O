#!/bin/bash
# ============================================================
# agnostic-core - Migracao: flat .md -> plugin SKILL.md
# Converte skills/cat/foo.md -> skills-plugin/cat/foo/SKILL.md
# mantendo os originais intactos.
#
# Uso:
#   ./migrate-to-plugin.sh                   # migra tudo
#   ./migrate-to-plugin.sh --category workflow
#   ./migrate-to-plugin.sh --dry-run
# ============================================================

set -e

CATEGORY=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --category) CATEGORY="$2"; shift 2;;
    --dry-run)  DRY_RUN=true; shift;;
    *) echo "Uso: $0 [--category <nome>] [--dry-run]"; exit 1;;
  esac
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS_SRC="$REPO_ROOT/skills"
SKILLS_DEST="$REPO_ROOT/skills-plugin"

if [ ! -d "$SKILLS_SRC" ]; then
  echo "ERRO: $SKILLS_SRC nao encontrado"
  exit 1
fi

extract_description() {
  local file="$1"
  local fallback="$2"
  local desc=""

  # Tenta frontmatter existente
  if head -n1 "$file" | grep -q '^---'; then
    desc=$(awk '/^---$/{c++; next} c==1 && /^description:/{sub(/^description:[[:space:]]*/,""); gsub(/^["'\'']|["'\'']$/,""); print; exit}' "$file")
    [ -z "$desc" ] && desc=$(awk '/^---$/{c++; next} c==1 && /^title:/{sub(/^title:[[:space:]]*/,""); gsub(/^["'\'']|["'\'']$/,""); print; exit}' "$file")
  fi

  # Fallback: primeiro paragrafo apos H1
  if [ -z "$desc" ]; then
    desc=$(awk 'BEGIN{in_body=0; found_h1=0} /^---$/{fm++; if(fm==2) in_body=1; next} in_body && /^# /{found_h1=1; next} found_h1 && NF>0 && !/^#/{print; exit}' "$file")
    [ -z "$desc" ] && desc=$(awk '/^# /{found=1; next} found && NF>0 && !/^#/{print; exit}' "$file")
  fi

  [ -z "$desc" ] && desc="Skill $fallback do agnostic-core"
  echo "$desc" | tr -d '"'
}

if [ -n "$CATEGORY" ]; then
  CATS=("$SKILLS_SRC/$CATEGORY")
else
  CATS=("$SKILLS_SRC"/*/)
fi

migrated=0
skipped=0

for cat_dir in "${CATS[@]}"; do
  [ -d "$cat_dir" ] || continue
  cat_name=$(basename "$cat_dir")
  echo ""
  echo "== Categoria: $cat_name =="

  for f in "$cat_dir"*.md; do
    [ -f "$f" ] || continue
    skill_name=$(basename "$f" .md)
    dest_dir="$SKILLS_DEST/$cat_name/$skill_name"
    dest_file="$dest_dir/SKILL.md"

    if [ -f "$dest_file" ]; then
      echo "  [SKIP] $cat_name/$skill_name (ja existe)"
      skipped=$((skipped+1))
      continue
    fi

    if $DRY_RUN; then
      echo "  [DRY]  $(basename "$f") -> $cat_name/$skill_name/SKILL.md"
      continue
    fi

    desc=$(extract_description "$f" "$skill_name")

    # Body: remove frontmatter existente
    body=$(awk '/^---$/{c++; if(c==2){in_body=1; next}} in_body{print}' "$f")
    if [ -z "$body" ]; then body=$(cat "$f"); fi

    mkdir -p "$dest_dir"
    {
      echo "---"
      echo "name: $skill_name"
      echo "description: $desc"
      echo "---"
      echo ""
      echo "$body"
    } > "$dest_file"

    echo "  [OK]   $cat_name/$skill_name"
    migrated=$((migrated+1))
  done
done

echo ""
echo "Migrados: $migrated | Pulados: $skipped"
$DRY_RUN && echo "(dry-run - nenhum arquivo escrito)"
