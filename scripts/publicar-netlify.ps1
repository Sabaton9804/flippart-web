# Despliegue con Netlify CLI (requiere: npx netlify login)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$web = Join-Path $root "web"

Push-Location $web
try {
  Write-Host "Verificando sesion Netlify..." -ForegroundColor Cyan
  $status = npx --yes netlify status 2>&1 | Out-String
  if ($status -match "Not logged in") {
    Write-Host "Inicia sesion en Netlify (se abrira el navegador)..." -ForegroundColor Yellow
    npx --yes netlify login
  }

  Write-Host "Desplegando sitio en produccion..." -ForegroundColor Cyan
  npx --yes netlify deploy --prod --dir $web

  Write-Host ""
  Write-Host "Sitio desplegado. Agrega el dominio en Netlify:" -ForegroundColor Green
  Write-Host "  flippart.com.co"
  Write-Host ""
  Write-Host "DNS en tu registrador:" -ForegroundColor Yellow
  Write-Host "  A     @    75.2.60.5"
  Write-Host "  CNAME www  [tu-sitio].netlify.app"
}
finally {
  Pop-Location
}
