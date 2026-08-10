-- Ilustrações reais de capa por trilha (opcional — cai no visual gerado
-- por código quando não definida).
-- Rode este arquivo no SQL Editor do Supabase depois do 0001_init.sql.

alter table public.tracks add column if not exists cover_image_path text;

-- Bucket público (a ilustração em si não é conteúdo pago — só decorativa).
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers bucket: public read"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "covers bucket: admin write"
  on storage.objects for insert
  with check (bucket_id = 'covers' and public.is_admin());

create policy "covers bucket: admin update"
  on storage.objects for update
  using (bucket_id = 'covers' and public.is_admin());

create policy "covers bucket: admin delete"
  on storage.objects for delete
  using (bucket_id = 'covers' and public.is_admin());
