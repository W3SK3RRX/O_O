# update-agnostic-core.ps1
# Atualiza o submodule agnostic-core em TODOS os projetos que o possuem.
# Nao requer lista fixa de projetos — varre C:\PROJETOS automaticamente.

$PROJETOS_ROOT = "C:\PROJETOS"
$IGNORAR       = @("agnostic-core")

$projetos = Get-ChildItem -Path $PROJETOS_ROOT -Directory | Where-Object {
    $_.Name -notin $IGNORAR -and
    (Test-Path "$($_.FullName)\.git") -and
    (Test-Path "$($_.FullName)\.agnostic-core")
}

if ($projetos.Count -eq 0) {
    Write-Host "`nNenhum projeto com agnostic-core encontrado em $PROJETOS_ROOT" -ForegroundColor Yellow
    exit
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host " Atualizando agnostic-core nos projetos" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$ok    = @()
$falha = @()
$skip  = @()

foreach ($projeto in $projetos) {
    $path = $projeto.FullName
    $nome = $projeto.Name

    Write-Host "  $nome" -ForegroundColor Yellow
    Push-Location $path

    # Verificar se ha alteracoes pendentes antes de mexer
    $status = git status --porcelain 2>&1
    if ($status) {
        Write-Host "    AVISO: projeto tem alteracoes nao commitadas, pulando" -ForegroundColor DarkYellow
        $skip += $nome
        Pop-Location
        continue
    }

    git submodule update --remote .agnostic-core 2>&1 | Out-Null

    $diff = git diff --cached --name-only 2>&1
    $diffUnstaged = git diff --name-only 2>&1

    if ($diffUnstaged -match "agnostic-core" -or $diff -match "agnostic-core") {
        git add .agnostic-core 2>&1 | Out-Null
        git commit -m "chore: update agnostic-core submodule" 2>&1 | Out-Null
        git push 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "    OK atualizado e pushed" -ForegroundColor Green
            $ok += $nome
        } else {
            Write-Host "    ERRO no push" -ForegroundColor Red
            $falha += $nome
        }
    } else {
        Write-Host "    ja esta na versao mais recente" -ForegroundColor DarkGray
        $skip += $nome
    }

    Pop-Location
}

# ── Resumo ──────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host " Resumo" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Atualizados : $($ok.Count)  ($($ok -join ', '))" -ForegroundColor Green
Write-Host "  Ja ok/skip  : $($skip.Count)  ($($skip -join ', '))" -ForegroundColor DarkGray
if ($falha.Count -gt 0) {
Write-Host "  Com erro    : $($falha.Count)  ($($falha -join ', '))" -ForegroundColor Red
}
Write-Host ""
