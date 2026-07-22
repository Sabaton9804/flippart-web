Add-Type -AssemblyName System.Drawing

$base = Join-Path $PSScriptRoot "..\web\assets\workflow"

$crops = @{
    "paso-01-whatsapp.png" = @{ X = 42; Y = 98; W = 448; H = 702 }
    "paso-02-diseno.png"   = @{ X = 108; Y = 40; W = 900; H = 860 }
}

foreach ($entry in $crops.GetEnumerator()) {
    $file = $entry.Key
    $crop = $entry.Value
    $path = Join-Path $base $file
    $backup = Join-Path $base ($file -replace '\.png$', '.orig.png')

    if (-not (Test-Path $backup)) {
        Copy-Item $path $backup
        Write-Host "Backup $backup"
    }

    $source = if (Test-Path $backup) { $backup } else { $path }
    $bmp = [System.Drawing.Bitmap]::FromFile($source)
    $rect = New-Object System.Drawing.Rectangle $crop.X, $crop.Y, $crop.W, $crop.H
    $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
    $cropped.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    Write-Host "Cropped $file -> $($crop.W)x$($crop.H)"

    $bmp.Dispose()
    $cropped.Dispose()
}

Get-ChildItem $base -Filter '*-preview.png' | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem $base -Filter '*-crop.png' | Remove-Item -Force -ErrorAction SilentlyContinue
