# Publicar FlippArt en Hostinger (via GitHub)
# Hostinger está conectado a este repo: un push a main despliega automáticamente.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "=== FlippArt - Publicar en Hostinger ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "El sitio se despliega solo al hacer push a GitHub (rama main)." -ForegroundColor White
Write-Host "Hostinger descarga el repo y publica web/ gracias a .htaccess." -ForegroundColor White
Write-Host ""

$status = git -C $root status --porcelain 2>&1
if (-not $status) {
  Write-Host "No hay cambios locales. Comprueba si ya están en GitHub:" -ForegroundColor Yellow
  git -C $root log -1 --oneline
  Write-Host ""
  Write-Host "Si Hostinger no actualizó, entra al panel de Hostinger -> Git -> Deploy now" -ForegroundColor Yellow
  exit 0
}

Write-Host "Cambios pendientes:" -ForegroundColor Yellow
git -C $root status --short
Write-Host ""

$msg = Read-Host "Mensaje del commit (Enter = 'Actualizar sitio FlippArt')"
if (-not $msg) { $msg = "Actualizar sitio FlippArt" }

git -C $root add -A
git -C $root commit -m $msg
git -C $root push origin main

Write-Host ""
Write-Host "Push completado. Hostinger tardará 1-5 min en actualizar." -ForegroundColor Green
Write-Host "Sitio: https://flippart.com.co" -ForegroundColor White
Write-Host "Si no carga, ejecuta: scripts\verificar-dominio.ps1" -ForegroundColor DarkGray
Write-Host ""
