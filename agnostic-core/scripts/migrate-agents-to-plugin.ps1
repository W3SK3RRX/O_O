# ============================================================
# agnostic-core - Flatten agents/ -> agents-plugin/
#
# Plugin spec: agents devem estar em agents/*.md (flat).
# Atualmente estao em agents/reviewers/, agents/generators/ etc.
# Este script copia todos .md para agents-plugin/<basename> preservando
# frontmatter existente (agents ja tem name + description).
#
# Uso:
#   .\migrate-agents-to-plugin.ps1
#   .\migrate-agents-to-plugin.ps1 -DryRun
# ============================================================

#Requires -Version 5.1
[CmdletBinding()]
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'

$repoRoot    = Split-Path -Parent $PSScriptRoot
$agentsSrc   = Join-Path $repoRoot 'agents'
$agentsDest  = Join-Path $repoRoot 'agents-plugin'

if (-not (Test-Path $agentsSrc)) {
  Write-Host "ERRO: $agentsSrc nao encontrado" -ForegroundColor Red
  exit 1
}

$files = Get-ChildItem -Path $agentsSrc -Filter '*.md' -File -Recurse
if (-not $files) {
  Write-Host "Nenhum agent encontrado" -ForegroundColor Yellow
  exit 0
}

# Deteccao de colisao antes de copiar
$byName = $files | Group-Object Name
$collisions = $byName | Where-Object { $_.Count -gt 1 }
if ($collisions) {
  Write-Host "ERRO: nomes duplicados encontrados:" -ForegroundColor Red
  foreach ($c in $collisions) {
    Write-Host "  $($c.Name):"
    $c.Group | ForEach-Object { Write-Host "    - $($_.FullName)" }
  }
  exit 1
}

$migrated = 0
$skipped  = 0

foreach ($f in $files | Sort-Object Name) {
  $destFile = Join-Path $agentsDest $f.Name
  $relSrc = $f.FullName.Substring($agentsSrc.Length).TrimStart('\','/') -replace '\\','/'

  if (Test-Path $destFile) {
    Write-Host "  [SKIP] $($f.Name) (ja existe)" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  if ($DryRun) {
    Write-Host "  [DRY]  $relSrc -> agents-plugin/$($f.Name)"
    continue
  }

  New-Item -ItemType Directory -Path $agentsDest -Force | Out-Null
  Copy-Item $f.FullName $destFile
  Write-Host "  [OK]   $relSrc -> agents-plugin/$($f.Name)" -ForegroundColor Green
  $migrated++
}

Write-Host ""
Write-Host "Migrados: $migrated | Pulados: $skipped" -ForegroundColor Cyan
if ($DryRun) { Write-Host "(dry-run - nenhum arquivo escrito)" -ForegroundColor Yellow }
