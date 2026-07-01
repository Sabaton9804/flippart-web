# Publicar FlippArt en Netlify (gratis)
$root = $PSScriptRoot
$web = Join-Path $root "web"
$zip = Join-Path $root "flippart-web.zip"

Write-Host "Creando paquete de despliegue..."
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$web\*" -DestinationPath $zip -Force

Write-Host "Paquete listo: $zip"
Write-Host ""
Write-Host "=== DESPLIEGUE ==="
Write-Host "1. Abre https://app.netlify.com/drop y arrastra flippart-web.zip"
Write-Host "2. En Netlify: Site settings -> Environment variables, agrega:"
Write-Host "     CALLMEBOT_API_KEY  (registro gratis en callmebot.com)"
Write-Host "     SUPABASE_SERVICE_ROLE_KEY  (Supabase -> Settings -> API)"
Write-Host "3. Vuelve a desplegar despues de agregar variables"
Write-Host ""
Write-Host "=== SUPABASE (SQL Editor, una sola vez) ==="
Write-Host "Copia y ejecuta: supabase/migrations/20260630_lead_photos.sql"
Write-Host ""
Start-Process "https://app.netlify.com/drop"
Start-Process explorer.exe -ArgumentList "/select,`"$zip`""
