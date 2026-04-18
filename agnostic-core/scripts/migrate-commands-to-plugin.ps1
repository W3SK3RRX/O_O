# ============================================================
# agnostic-core - commands/ -> commands-plugin/
#
# Migra os workflows em commands/workflows/*.md para commands-plugin/*.md
# com frontmatter name + description. Arquivos de indice (COMMANDS.md) e
# catalogos (scripts.md) sao ignorados pois nao sao slash commands reais.
#
# Uso:
#   .\migrate-commands-to-plugin.ps1
#   .\migrate-commands-to-plugin.ps1 -DryRun
# ============================================================

#Requires -Version 5.1
[CmdletBinding()]
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $repoRoot 'commands\workflows'
$dest = Join-Path $repoRoot 'commands-plugin'

if (-not (Test-Path $src)) {
  Write-Host "ERRO: $src nao encontrado" -ForegroundColor Red
  exit 1
}

$descriptions = @{
  'brainstorm' = 'Explorar opcoes e tomar decisoes informadas antes de implementar. Use ao iniciar feature nova quando ainda nao ha consenso sobre a abordagem.'
  'create'     = 'Criar nova aplicacao ou feature completa do zero com escopo, stack, estrutura e primeiros arquivos.'
  'debug'      = 'Investigacao sistematica de bugs em 4 fases: reproduzir, isolar, entender causa raiz, corrigir.'
  'deploy'     = 'Processo de deploy seguro e verificavel: checklist pre-deploy, execucao, validacao pos-deploy, rollback.'
}

$files = Get-ChildItem -Path $src -Filter '*.md' -File
$migrated = 0
$skipped  = 0

foreach ($f in $files | Sort-Object Name) {
  $name = $f.BaseName
  $destFile = Join-Path $dest "$name.md"

  if (Test-Path $destFile) {
    Write-Host "  [SKIP] $name (ja existe)" -ForegroundColor DarkGray
    $skipped++
    continue
  }

  if ($DryRun) {
    Write-Host "  [DRY]  workflows/$($f.Name) -> commands-plugin/$name.md"
    continue
  }

  $content = Get-Content $f.FullName -Raw
  $desc = if ($descriptions.ContainsKey($name)) { $descriptions[$name] } else { "Workflow $name do agnostic-core" }

  # Remove frontmatter existente se houver
  if ($content -match '(?ms)^---\s*\r?\n.*?\r?\n---\s*\r?\n(.*)$') {
    $body = $Matches[1]
  } else {
    $body = $content
  }

  $newContent = @"
---
name: $name
description: $desc
---

$($body.TrimStart())
"@

  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($destFile, $newContent, $utf8NoBom)
  Write-Host "  [OK]   commands-plugin/$name.md" -ForegroundColor Green
  $migrated++
}

Write-Host ""
Write-Host "Migrados: $migrated | Pulados: $skipped" -ForegroundColor Cyan
if ($DryRun) { Write-Host "(dry-run - nenhum arquivo escrito)" -ForegroundColor Yellow }
