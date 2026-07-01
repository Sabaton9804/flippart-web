# Activar CallMeBot para alertas de cotizacion en WhatsApp (gratis, 2 minutos)
# 1. Abre WhatsApp en el telefono +57 318 294 1864
# 2. Envia este mensaje al contacto +34 684 73 71 87 (CallMeBot):
#    I allow callmebot to send me messages
# 3. Recibiras tu API key por WhatsApp
# 4. Pegala en Netlify -> Environment variables -> CALLMEBOT_API_KEY
#    O en web/netlify/functions/submit-lead.mjs -> CALLMEBOT_API_KEY_INLINE

Write-Host "Abriendo WhatsApp Web..."
Start-Process "https://web.whatsapp.com/send?phone=34684737187&text=I%20allow%20callmebot%20to%20send%20me%20messages"
Write-Host ""
Write-Host "Pasos:"
Write-Host "1. Envia el mensaje precargado desde el WhatsApp de FlippArt (+57 318 294 1864)"
Write-Host "2. CallMeBot te respondera con tu API key"
Write-Host "3. Agregala en Netlify como CALLMEBOT_API_KEY y redespliega"
