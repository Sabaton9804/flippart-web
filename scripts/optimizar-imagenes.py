"""Genera versiones WebP/JPG (máx. 1200 px) de las imágenes pesadas que usa web/
y los pósters de los videos del proceso.

Uso (desde la raíz del repo):  python3 scripts/optimizar-imagenes.py
Requiere Pillow y ffmpeg. Los originales no se modifican.
"""
import subprocess
from pathlib import Path

from PIL import Image

WEB = Path(__file__).resolve().parent.parent / "web"
CREMA = (245, 239, 227)
TINTA = (31, 27, 24)

# origen -> (destino sin extensión, ancho máx., fondo para aplanar transparencias, formatos)
IMAGENES = {
    "media/Mascotas/Coco/Figura Coco.png": ("assets/portafolio/coco-figura-vitrina", 1200, CREMA, ("webp", "jpg")),
    "assets/workflow/paso-01-whatsapp.png": ("assets/workflow/paso-01-whatsapp", 800, CREMA, ("webp", "jpg")),
    "assets/workflow/paso-02-diseno.png": ("assets/workflow/paso-02-diseno", 800, CREMA, ("webp", "jpg")),
    "assets/workflow/paso-03-pintura.png": ("assets/workflow/paso-03-pintura", 800, CREMA, ("webp", "jpg")),
    "assets/workflow/paso-04-entrega.png": ("assets/workflow/paso-04-entrega", 1200, CREMA, ("webp", "jpg")),
    "assets/pricing/flippart-showcase.png": ("assets/pricing/flippart-showcase", 1200, CREMA, ("webp", "jpg")),
    "assets/pricing/regalo-caja.png": ("assets/pricing/regalo-caja", 600, CREMA, ("webp", "jpg")),
    "assets/services/personas-alicia-figura.png": ("assets/services/personas-alicia-figura", 800, CREMA, ("webp", "jpg")),
    "assets/vitrina/detalle-acabado-artesanal.png": ("assets/vitrina/detalle-acabado-artesanal", 800, TINTA, ("webp", "jpg")),
    "assets/vitrina/obra-iluminada-vitrina.png": ("assets/vitrina/obra-iluminada-vitrina", 900, TINTA, ("webp", "jpg")),
    "assets/gallery/benji/figura.png": ("assets/portafolio/galeria/benji-figura", 900, CREMA, ("webp",)),
    "assets/gallery/benji/original.png": ("assets/portafolio/galeria/benji-original", 600, CREMA, ("webp",)),
    "media/Mascotas/Coco/Original Coco.jpeg": ("assets/portafolio/galeria/coco-original", 600, CREMA, ("webp",)),
    "media/Mascotas/Estrella/Caja oficial.png": ("assets/portafolio/galeria/estrella-figura", 900, CREMA, ("webp",)),
    "media/Mascotas/Estrella/original.png": ("assets/portafolio/galeria/estrella-original", 600, CREMA, ("webp",)),
    "media/Mascotas/Max/Max.jpeg": ("assets/portafolio/galeria/max-figura", 900, CREMA, ("webp",)),
    "media/Mascotas/Max/original.jpeg": ("assets/portafolio/galeria/max-original", 600, CREMA, ("webp",)),
    "media/Mascotas/Toby/Toby.jpeg": ("assets/portafolio/galeria/toby-figura", 900, CREMA, ("webp",)),
    "assets/gallery/toby/original.png": ("assets/portafolio/galeria/toby-original", 600, CREMA, ("webp",)),
    "assets/gallery/rocco/figura.png": ("assets/portafolio/galeria/rocco-figura", 900, CREMA, ("webp",)),
    "assets/gallery/rocco/original.png": ("assets/portafolio/galeria/rocco-original", 600, CREMA, ("webp",)),
    "media/Personas/Familiares/Abuelos Pedro y Rebeca/Figura Abuelos.jpeg": ("assets/portafolio/galeria/abuelos-figura", 900, CREMA, ("webp",)),
    "media/Personas/Familiares/Abuelos Pedro y Rebeca/Abuelos.jpeg": ("assets/portafolio/galeria/abuelos-original", 600, CREMA, ("webp",)),
    "media/Personas/Familiares/Familia Carolina/Figura familia.jpeg": ("assets/portafolio/galeria/familia-figura", 900, CREMA, ("webp",)),
    "assets/gallery/familia/original.png": ("assets/portafolio/galeria/familia-original", 600, CREMA, ("webp",)),
    "media/Personas/Hobbies/Chica Salsa/Figura chica salsa.jpeg": ("assets/portafolio/galeria/salsa-figura", 900, CREMA, ("webp",)),
    "assets/gallery/chica-salsa/original.png": ("assets/portafolio/galeria/salsa-original", 600, CREMA, ("webp",)),
    "media/Personas/Hobbies/Motero Antonia/WhatsApp Image 2026-05-17 at 5.17.25 PM (6).jpeg": ("assets/portafolio/galeria/antonia-figura", 900, CREMA, ("webp",)),
    "media/Personas/Hobbies/Motero Antonia/Motero.jpeg": ("assets/portafolio/galeria/antonia-original", 600, CREMA, ("webp",)),
    "assets/gallery/motero-mi-nena/figura.png": ("assets/portafolio/galeria/mi-nena-figura", 900, CREMA, ("webp",)),
    "media/Personas/Hobbies/Motero Mi Nena/Original .jpeg": ("assets/portafolio/galeria/mi-nena-original", 600, CREMA, ("webp",)),
    "media/Personas/Reconocimientos Juez/Juez Gloria/Figura Juez Gloria M .png": ("assets/portafolio/galeria/juez-gloria-figura", 900, CREMA, ("webp",)),
    "media/Personas/Reconocimientos Juez/Juez Sandra/Juez figura Sandra.jpeg": ("assets/portafolio/galeria/juez-sandra-figura", 900, CREMA, ("webp",)),
    "media/Personas/Reconocimientos Juez/Juez Sandra/Original.jpg": ("assets/portafolio/galeria/juez-sandra-original", 600, CREMA, ("webp",)),
}

# video -> (póster, segundo del fotograma)
VIDEOS = {
    "media/Proceso/proceso-3.mp4": ("assets/proceso/poster-proceso-3.jpg", "0.5"),
    "media/Proceso/proceso-4.mp4": ("assets/proceso/poster-proceso-4.jpg", "0.5"),
    "media/Proceso/proceso-moto.mp4": ("assets/proceso/poster-proceso-moto.jpg", "3"),
    "media/Proceso/proceso-1.mp4": ("assets/proceso/poster-proceso-1.jpg", "0.5"),
}


def aplanar(im, fondo):
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        base = Image.new("RGB", im.size, fondo)
        base.paste(im, mask=im.split()[-1])
        return base
    return im.convert("RGB")


def optimizar(origen, destino, ancho, fondo, formatos):
    im = Image.open(WEB / origen)
    if im.width > ancho:
        im = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
    salida = WEB / destino
    salida.parent.mkdir(parents=True, exist_ok=True)
    tiene_alfa = im.mode in ("RGBA", "LA", "P")
    for fmt in formatos:
        ruta = salida.with_suffix("." + fmt)
        if fmt == "webp":
            (im.convert("RGBA") if tiene_alfa else im.convert("RGB")).save(ruta, "WEBP", quality=80, method=6)
        else:
            aplanar(im, fondo).save(ruta, "JPEG", quality=80, optimize=True, progressive=True)
        print(f"{(WEB / origen).stat().st_size // 1024:6d} KB -> {ruta.stat().st_size // 1024:5d} KB  {ruta.relative_to(WEB)}")


def poster(video, destino, segundo):
    ruta = WEB / destino
    ruta.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", segundo, "-i", str(WEB / video),
                    "-frames:v", "1", "-vf", "scale='min(720,iw)':-2", "-q:v", "4", str(ruta)], check=True)
    print(f"poster {ruta.stat().st_size // 1024:5d} KB  {ruta.relative_to(WEB)}")


if __name__ == "__main__":
    for origen, (destino, ancho, fondo, formatos) in IMAGENES.items():
        optimizar(origen, destino, ancho, fondo, formatos)
    for video, (destino, segundo) in VIDEOS.items():
        poster(video, destino, segundo)
