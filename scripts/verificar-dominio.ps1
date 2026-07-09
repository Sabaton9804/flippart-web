# Diagnóstico rápido: por qué no carga flippart.com.co (Hostinger)
$ErrorActionPreference = "Continue"
$domain = "flippart.com.co"

Write-Host ""
Write-Host "=== Diagnóstico FlippArt ($domain) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Hosting: Hostinger (conectado al repo GitHub, rama main)" -ForegroundColor White
Write-Host ""

try {
  $records = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop
  $ip = ($records | Where-Object { $_.Type -eq 'A' } | Select-Object -First 1).IPAddress
  Write-Host "DNS actual:  $domain -> $ip"

  if ($ip -match '^82\.') {
    Write-Host "Estado DNS:  OK (apunta a Hostinger)" -ForegroundColor Green
  } else {
    Write-Host "Estado DNS:  Revisar configuración" -ForegroundColor Yellow
    Write-Host "El dominio debería apuntar a los nameservers de Hostinger." -ForegroundColor Yellow
    Write-Host "En Hostinger: Websites -> flippart.com.co -> DNS / Nameservers" -ForegroundColor White
  }
} catch {
  Write-Host "No se pudo resolver DNS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "URL pública del sitio:" -ForegroundColor Cyan
Write-Host "  https://$domain" -ForegroundColor White
Write-Host ""

try {
  $r = Invoke-WebRequest -Uri "https://$domain/" -MaximumRedirection 3 -TimeoutSec 15 -UseBasicParsing
  Write-Host "Sitio responde: HTTP $($r.StatusCode)" -ForegroundColor Green
  if ($r.Content -match '<title>([^<]+)</title>') {
    Write-Host "Título: $($matches[1])"
  }
} catch {
  Write-Host "El sitio no responde bien desde aquí: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Si el sitio no se actualizó tras un push:" -ForegroundColor Yellow
Write-Host "  1. Hostinger -> Websites -> Git -> Deploy now" -ForegroundColor White
Write-Host "  2. Confirma que la rama conectada es 'main'" -ForegroundColor White
Write-Host "  3. Espera 1-5 minutos y recarga con Ctrl+F5" -ForegroundColor White
Write-Host ""
