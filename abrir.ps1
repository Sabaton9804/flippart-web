# Abrir FlippArt en el navegador (sitio local)
$url = "http://127.0.0.1:5500"
$web = Join-Path $PSScriptRoot "web"

$listening = Get-NetTCPConnection -LocalPort 5500 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  Write-Host "Iniciando servidor local..."
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx --yes serve `"$web`" -l 5500" -WindowStyle Minimized
  Start-Sleep -Seconds 4
}

Write-Host "Abriendo FlippArt: $url"
Start-Process $url
