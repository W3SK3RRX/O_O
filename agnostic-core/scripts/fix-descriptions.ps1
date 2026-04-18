# ============================================================
# agnostic-core - Fix descriptions usando docs/skills-index.md
#
# O script de migracao cai em fallback ("Skill X do agnostic-core") quando
# o .md fonte nao tem # H1 + paragrafo. Este script le docs/skills-index.md
# (que tem descricoes canonicas por skill) e atualiza o frontmatter de cada
# SKILL.md em skills-plugin/.
# ============================================================

#Requires -Version 5.1
[CmdletBinding()]
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'

$repoRoot  = Split-Path -Parent $PSScriptRoot
$indexFile = Join-Path $repoRoot 'docs\skills-index.md'
$destRoot  = Join-Path $repoRoot 'skills-plugin'

if (-not (Test-Path $indexFile)) {
  Write-Host "ERRO: $indexFile nao encontrado" -ForegroundColor Red
  exit 1
}

# Parse skills-index.md: linhas no formato "  skills/cat/name.md   Descricao..."
# Uma regex unica que cobre tanto skills/cat/name.md quanto skills/cat/name/SKILL.md.
$indexMap = @{}
$lines = Get-Content $indexFile
foreach ($line in $lines) {
  if ($line -match '^\s*skills/([a-zA-Z0-9\-_/]+)\.md\s+(\S.*)$') {
    $relPath = $Matches[1]
    $desc    = $Matches[2].Trim()
    # Normaliza: skills/foo/SKILL -> skills/foo (nome da skill, nao do arquivo)
    if ($relPath -match '^(.+)/SKILL$') { $relPath = $Matches[1] }
    $indexMap[$relPath] = $desc
  }
}

Write-Host "Descricoes no indice: $($indexMap.Count)" -ForegroundColor Cyan

$updated = 0
$kept    = 0
$notFound = @()

Get-ChildItem -Path $destRoot -Filter 'SKILL.md' -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($destRoot.Length).TrimStart('\','/') -replace '\\','/'
  # Remove trailing /SKILL.md para casar com a key do indexMap
  $key = $rel -replace '/SKILL\.md$',''

  # Tenta variacoes: key, key sem ultimo segmento repetido, etc.
  $desc = $null
  if ($indexMap.ContainsKey($key)) {
    $desc = $indexMap[$key]
  } else {
    # skills/design-system/SKILL -> key = "design-system" no index
    $simpleKey = $key -replace '/SKILL$',''
    if ($indexMap.ContainsKey($simpleKey)) { $desc = $indexMap[$simpleKey] }
  }

  if (-not $desc) {
    $notFound += $rel
    $kept++
    return
  }

  # Normaliza espacos em branco e escapa aspas simples para YAML (duplica)
  $desc = ($desc -replace '\s+',' ').Trim()
  $yamlSafe = $desc -replace "'","''"
  $quoted = "'" + $yamlSafe + "'"

  $content = Get-Content $_.FullName -Raw
  if ($content -match '(?ms)^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$') {
    $fm   = $Matches[1]
    $body = $Matches[2]

    # Atualiza linha description no frontmatter com valor YAML quotado
    $newFm = $fm -replace '(?m)^description:\s*.+$', "description: $quoted"

    $newContent = "---`n$newFm`n---`n`n$body"

    if ($DryRun) {
      Write-Host "  [DRY]  $rel"
      Write-Host "    desc: $desc" -ForegroundColor DarkGray
      return
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($_.FullName, $newContent, $utf8NoBom)
    Write-Host "  [OK]   $rel" -ForegroundColor Green
    $updated++
  }
}

Write-Host ""
Write-Host "Atualizados: $updated | Mantidos (nao no indice): $kept" -ForegroundColor Cyan
if ($notFound.Count -gt 0) {
  Write-Host "Skills sem entrada no indice (kept as-is):" -ForegroundColor Yellow
  $notFound | ForEach-Object { Write-Host "  - $_" }
}
if ($DryRun) { Write-Host "(dry-run - nenhum arquivo escrito)" -ForegroundColor Yellow }
