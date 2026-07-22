# Abrir FlippArt en el navegador (servidor local con recarga automática)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$web = Join-Path $root "web"
$port = 5500
$url = "http://127.0.0.1:$port"

function Test-PortListening([int]$TargetPort) {
    return [bool](Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port([int]$TargetPort, [int]$TimeoutSec = 10) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening $TargetPort) { return $true }
        Start-Sleep -Milliseconds 200
    }
    return $false
}

if (-not (Test-Path (Join-Path $web "node_modules"))) {
    Write-Host "Instalando dependencias de desarrollo (solo la primera vez)..."
    Push-Location $web
    npm install --silent
    Pop-Location
}

if (-not (Test-PortListening $port)) {
    Write-Host "Iniciando servidor de desarrollo en puerto $port..."
    $cmd = "Set-Location '$web'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Minimized

    if (-not (Wait-Port $port)) {
        Write-Host "No se pudo iniciar el servidor en $port." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Servidor ya activo en puerto $port."
}

Write-Host "Abriendo FlippArt: $url"
Write-Host "Los cambios en HTML/CSS/JS se recargan solos." -ForegroundColor DarkGray
Start-Process $url
