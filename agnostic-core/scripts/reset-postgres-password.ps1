# ============================================================
# Reset senha do usuario 'postgres' no PostgreSQL 17 (Windows)
#
# IMPORTANTE: rode como ADMINISTRADOR.
# O script faz backup do pg_hba.conf, troca auth local para 'trust',
# reinicia o servico, define senha = '1234', restaura pg_hba.conf
# e reinicia o servico novamente.
# ============================================================

#Requires -Version 5.1
#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'

$pgData    = 'C:\Program Files\PostgreSQL\17\data'
$pgHba     = Join-Path $pgData 'pg_hba.conf'
$pgHbaBak  = "$pgHba.bak.$(Get-Date -Format yyyyMMddHHmmss)"
$service   = 'postgresql-x64-17'
$psql      = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
$newPass   = '1234'

if (-not (Test-Path $pgHba)) {
  Write-Host "ERRO: $pgHba nao encontrado" -ForegroundColor Red
  exit 1
}

Write-Host "=== 1/5 Backup pg_hba.conf ===" -ForegroundColor Cyan
Copy-Item $pgHba $pgHbaBak
Write-Host "  Backup: $pgHbaBak"

Write-Host "`n=== 2/5 Substituir auth local para trust ===" -ForegroundColor Cyan
$content = Get-Content $pgHba
# Troca scram-sha-256/md5 por trust apenas em linhas ipv4/ipv6/local nao-comentadas
$newContent = $content | ForEach-Object {
  if ($_ -match '^\s*(host|local)' -and $_ -notmatch '^\s*#') {
    ($_ -replace '\b(scram-sha-256|md5|password)\b','trust')
  } else { $_ }
}
$newContent | Set-Content $pgHba -Encoding ASCII
Write-Host "  pg_hba.conf modificado (auth = trust temporariamente)"

Write-Host "`n=== 3/5 Reiniciar PostgreSQL ===" -ForegroundColor Cyan
Restart-Service $service
Start-Sleep -Seconds 2
Write-Host "  Servico reiniciado"

Write-Host "`n=== 4/5 Resetar senha do postgres ===" -ForegroundColor Cyan
& $psql -h localhost -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '$newPass';"
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERRO ao alterar senha. Restaurando backup..." -ForegroundColor Red
  Copy-Item $pgHbaBak $pgHba -Force
  Restart-Service $service
  exit 1
}
Write-Host "  Senha alterada para: $newPass"

Write-Host "`n=== 5/5 Restaurar pg_hba.conf e reiniciar ===" -ForegroundColor Cyan
Copy-Item $pgHbaBak $pgHba -Force
Restart-Service $service
Start-Sleep -Seconds 2
Write-Host "  pg_hba.conf restaurado, servico reiniciado"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  CONCLUIDO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Usuario:  postgres"
Write-Host "  Senha:    $newPass"
Write-Host "  Backup:   $pgHbaBak (pode deletar depois)"
Write-Host ""
Write-Host "  Teste:    `$env:PGPASSWORD='$newPass'; psql -h localhost -U postgres -l"
Write-Host ""
