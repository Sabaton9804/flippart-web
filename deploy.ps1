# Publicar FlippArt en Netlify (gratis)
$root = $PSScriptRoot
$web = Join-Path $root "web"
$zip = Join-Path $root "flippart-web.zip"

Write-Host "Creando paquete de despliegue..."
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$web\*" -DestinationPath $zip -Force

Write-Host "Paquete listo: $zip"
Write-Host "Abriendo Netlify Drop - arrastra flippart-web.zip a la pagina"
Start-Process "https://app.netlify.com/drop"
Start-Process explorer.exe -ArgumentList "/select,`"$zip`""

Write-Host ""
Write-Host "Despues del deploy:"
Write-Host "1. Copia la URL que te da Netlify"
Write-Host "2. Pegala en web/js/config.js en siteUrl"
Write-Host "3. Vuelve a crear el zip y sube de nuevo"
