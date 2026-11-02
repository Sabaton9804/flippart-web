"""Genera las fotos de SC Calderón de /grado-ascenso en WebP + JPG de respaldo (480, 960 y 1440 px de ancho).

Uso (desde la raíz del repo):  python3 scripts/optimizar-fotos-grado.py [carpeta_originales]
Por defecto lee /workspace/flippart-fotos. Requiere Pillow. Los originales no se modifican.

Recortes suaves (bordes del portátil y teclado), nunca primeros planos del torso: las insignias
pintadas deben seguir siendo un detalle pequeño de la foto.
Convierte Display P3 a sRGB y no copia EXIF ni perfiles al resultado.
"""
import io
import sys
from pathlib import Path

from PIL import Image, ImageCms

ORIGEN = Path(sys.argv[1] if len(sys.argv) > 1 else "/workspace/flippart-fotos")
DESTINO = Path(__file__).resolve().parent.parent / "web" / "assets" / "grado"
ANCHOS = (480, 960, 1440)

# original -> (nombre de salida, caja de recorte en px del original: izq, arriba, der, abajo)
FOTOS = {
    "01M5XN817VJ6STA5QQN21PV97Y.jpg": ("sc-calderon-hero", (116, 320, 3916, 2853)),          # 3:2
    "01M5XN7ZAY6SSK45ZDYCDVY1VS.jpg": ("sc-calderon-frontal", (110, 0, 2910, 3733)),         # 3:4
    "01M5XN8082HHDKN8ZVZ47BZ578.jpg": ("sc-calderon-placa", (110, 220, 2910, 3953)),         # 3:4
    "01M5XN7V2HJQT4VZNH2JECBD8B.jpg": ("sc-calderon-tres-cuartos", (100, 430, 4060, 5710)),  # 3:4
}

SRGB = ImageCms.createProfile("sRGB")


def a_srgb(im):
    icc = im.info.get("icc_profile")
    im = im.convert("RGB")
    if not icc:
        return im
    origen = ImageCms.ImageCmsProfile(io.BytesIO(icc))
    return ImageCms.profileToProfile(im, origen, SRGB, outputMode="RGB")


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for archivo, (nombre, caja) in FOTOS.items():
        with Image.open(ORIGEN / archivo) as im:
            base = a_srgb(im).crop(caja)
        for ancho in ANCHOS:
            alto = round(base.height * ancho / base.width)
            img = base.resize((ancho, alto), Image.LANCZOS)
            img.save(DESTINO / f"{nombre}-{ancho}.webp", "WEBP", quality=78, method=6)
            img.save(DESTINO / f"{nombre}-{ancho}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
            print(f"{nombre}-{ancho}: {ancho}x{alto}")


if __name__ == "__main__":
    main()
