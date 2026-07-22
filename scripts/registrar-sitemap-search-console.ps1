# Registro SEO post-despliegue — FlippArt
$ErrorActionPreference = "Stop"
$domain = "flippart.com.co"
$sitemap = "https://$domain/sitemap.xml"

Write-Host ""
Write-Host "=== FlippArt — SEO en Search Console ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verificacion Google:" -ForegroundColor Yellow
Write-Host "  - DNS TXT ya configurado en $domain"
Write-Host "  - Meta tag en index.html y config.js"
Write-Host ""
Write-Host "Sitemap publico:" -ForegroundColor Green
Write-Host "  $sitemap"
Write-Host ""
Write-Host "Pasos en Search Console (1 minuto):" -ForegroundColor Yellow
Write-Host "  1. Abre https://search.google.com/search-console"
Write-Host "  2. Elige la propiedad $domain (deberia estar verificada por DNS)"
Write-Host "  3. Menu Sitemaps -> agregar: sitemap.xml"
Write-Host "  4. Solicitar indexacion de la URL principal si quieres acelerar"
Write-Host ""
Write-Host "Comprobando sitemap..." -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri $sitemap -UseBasicParsing -TimeoutSec 20
  Write-Host "Sitemap OK (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
  Write-Host "No se pudo leer el sitemap: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""
