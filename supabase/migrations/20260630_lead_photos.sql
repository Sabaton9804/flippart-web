-- Columna para URL de foto en leads
alter table public.flippart_leads
  add column if not exists foto_url text;

-- Bucket público para fotos de cotización
insert into storage.buckets (id, name, public)
values ('lead-photos', 'lead-photos', true)
on conflict (id) do nothing;

-- Permitir subida anónima desde el formulario web
create policy "Anon upload lead photos"
on storage.objects for insert
to anon
with check (bucket_id = 'lead-photos');

-- Lectura pública de fotos
create policy "Public read lead photos"
on storage.objects for select
to public
using (bucket_id = 'lead-photos');
