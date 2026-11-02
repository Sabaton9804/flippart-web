-- Fotos de referencia del formulario de cotización (web/js/main.js).
-- Idempotente: se puede ejecutar varias veces sin error.
--
-- El bucket es PRIVADO: el formulario solo sube la foto (insert anónimo) y nunca la vuelve a leer.
-- Camilo la ve desde el panel de Supabase (Storage → lead-photos) o con el enlace firmado temporal
-- que la Edge Function notify-lead incluye en la alerta de WhatsApp.

-- 1) Columna en la tabla que usa el formulario
alter table public.flippart_leads
  add column if not exists foto_url text;

comment on column public.flippart_leads.foto_url is
  'Ruta de la foto de referencia en el bucket privado lead-photos (ej. cotizaciones/2026-11-02/uuid.jpg). Null si no hay foto o no se pudo subir.';

-- 2) Bucket privado con límite de 8 MB y solo JPEG, PNG o WebP (Storage rechaza lo demás antes de guardar)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-photos', 'lead-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3) Políticas en storage.objects
-- La versión anterior de esta migración daba lectura pública (cualquiera podía listar todas las fotos).
drop policy if exists "Public read lead photos" on storage.objects;
drop policy if exists "Anon upload lead photos" on storage.objects;

-- Solo insertar (sin leer, actualizar ni borrar), dentro de cotizaciones/ y con extensión de imagen.
-- El tipo MIME real y el tamaño los hacen cumplir allowed_mime_types y file_size_limit del bucket.
create policy "Anon upload lead photos"
on storage.objects for insert
to anon
with check (
  bucket_id = 'lead-photos'
  and (storage.foldername(name))[1] = 'cotizaciones'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);
