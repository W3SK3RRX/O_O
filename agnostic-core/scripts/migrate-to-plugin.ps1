# ============================================================
# agnostic-core - Migracao: flat .md -> plugin SKILL.md
#
# Converte skills/cat/foo.md -> skills-plugin/cat/foo/SKILL.md
# mantendo os originais intactos (para usuarios em modo submodule).
#
# Uso:
#   .\migrate-to-plugin.ps1                      # migra tudo
#   .\migrate-to-plugin.ps1 -Category workflow   # so uma categoria
#   .\migrate-to-plugin.ps1 -DryRun              # lista sem escrever
# ============================================================

#Requires -Version 5.1
[CmdletBinding()]
param(
  [string]$Category = '',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$repoRoot   = Split-Path -Parent $PSScriptRoot
$skillsSrc  = Join-Path $repoRoot 'skills'
$skillsDest = Join-Path $repoRoot 'skills-plugin'

if (-not (Test-Path $skillsSrc)) {
  Write-Host "ERRO: $skillsSrc nao encontrado" -ForegroundColor Red
  exit 1
}

function ConvertTo-SkillFrontmatter {
  param([string]$Content, [string]$Name)

  # Extrai frontmatter existente (YAML entre --- ---)
  $hasFrontmatter = $Content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$'

  $description = $null
  $body        = $Content

  if ($hasFrontmatter) {
    $yaml = $Matches[1]
    $body = $Matches[2]
    if ($yaml -match '(?m)^description:\s*(.+)$') {
      $description = $Matches[1].Trim().Trim('"').Trim("'")
    } elseif ($yaml -match '(?m)^title:\s*(.+)$') {
      $description = $Matches[1].Trim().Trim('"').Trim("'")
    }
  }

  if (-not $description) {
    # Usa primeiro paragrafo apos # heading como descricao
    if ($body -match '(?ms)^#\s+.+?\r?\n\r?\n(.+?)(\r?\n\r?\n|$)') {
      $description = ($Matches[1] -replace '\r?\n', ' ').Trim()
      if ($description.Length -gt 200) {
        $description = $description.Substring(0, 197) + '...'
      }
    } else {
      $description = "Skill $Name do agnostic-core"
    }
  }

  $description = $description -replace '"', "'"

  $newFrontmatter = @"
---
name: $Name
description: $description
---

"@
  return $newFrontmatter + $body.TrimStart()
}

$searchRoot = if ($Category) { Join-Path $skillsSrc $Category } else { $skillsSrc }
if (-not (Test-Path $searchRoot)) {
  Write-Host "Nao encontrado: $searchRoot" -ForegroundColor Yellow
  exit 0
}

# Busca recursiva por TODOS os .md em skills/** (inclui SKILL.md e subcategorias)
$allMdFiles = Get-ChildItem -Path $searchRoot -Filter '*.md' -File -Recurse

$migrated = 0
$skipped  = 0
$lastCategoryLabel = ''

function Test-InsideSkillFolder {
  param([string]$FilePath, [string]$Root)
  # Retorna $true se qualquer ancestral (ate $Root) contem um SKILL.md
  # e nao e o proprio arquivo. Usado para detectar references/, assets/ etc.
  $current = Split-Path $FilePath -Parent
  while ($current -and ($current.Length -gt $Root.Length) -and ($current.StartsWith($Root))) {
    $candidate = Join-Path $current 'SKILL.md'
    if ((Test-Path $candidate) -and ($candidate -ne $FilePath)) { return $true }
    $current = Split-Path $current -Parent
  }
  return $false
}

foreach ($f in $allMdFiles | Sort-Object FullName) {
  $rel = $f.FullName.Substring($skillsSrc.Length).TrimStart('\','/')
  $relDir = Split-Path $rel -Parent
  $base   = $f.BaseName

  $topCat = ($relDir -split '[\\/]')[0]
  if ($topCat -ne $lastCategoryLabel) {
    Write-Host "`n== Categoria: $topCat ==" -ForegroundColor Cyan
    $lastCategoryLabel = $topCat
  }

  # Arquivo dentro de skill folder (references/, assets/ etc.) -> copia sem frontmatter fix
  if (Test-InsideSkillFolder -FilePath $f.FullName -Root $skillsSrc) {
    $destDir  = Join-Path $skillsDest $relDir
    $destFile = Join-Path $destDir $f.Name
    $displayPath = ($destFile.Substring($skillsDest.Length).TrimStart('\','/')) -replace '\\','/'

    if (Test-Path $destFile) {
      Write-Host "  [SKIP] $displayPath (ref, ja existe)" -ForegroundColor DarkGray
      $skipped++
      continue
    }
    if ($DryRun) {
      Write-Host "  [DRY]  $rel -> $displayPath (ref)"
      continue
    }
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item $f.FullName $destFile
    Write-Host "  [REF]  $displayPath" -ForegroundColor Blue
    $migrated++
    continue
  }

  # Decisao de destino para skill
  # SKILL.md na raiz de uma pasta -> mantem estrutura
  # foo.md solto -> vira foo/SKILL.md
  if ($base -eq 'SKILL') {
    $destDir  = Join-Path $skillsDest $relDir
    $skillName = Split-Path $relDir -Leaf
  } else {
    $destDir  = Join-Path $skillsDest (Join-Path $relDir $base)
    $skillName = $base
  }
  $destFile = Join-Path $destDir 'SKILL.md'
  $displayPath = ($destFile.Substring($skillsDest.Length).TrimStart('\','/')) -replace '\\','/'

  if (Test-Path $destFile) {
    Write-Host "  [SKIP] $displayPath (ja existe)" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  if ($DryRun) {
    Write-Host "  [DRY]  $rel -> $displayPath"
    continue
  }

  $content = Get-Content $f.FullName -Raw
  $newContent = ConvertTo-SkillFrontmatter -Content $content -Name $skillName

  New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($destFile, $newContent, $utf8NoBom)

  Write-Host "  [OK]   $displayPath" -ForegroundColor Green
  $migrated++
}

Write-Host ""
Write-Host "Migrados: $migrated | Pulados: $skipped" -ForegroundColor Cyan
if ($DryRun) { Write-Host "(dry-run - nenhum arquivo escrito)" -ForegroundColor Yellow }
