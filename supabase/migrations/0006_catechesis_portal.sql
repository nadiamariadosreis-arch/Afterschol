-- Portal de catequese — reorganiza jogos/categorias em um sistema geral de
-- categorias (pastas temáticas, cada uma com sua própria capa) e materiais
-- (apostilas, cartões, jogos, avaliações, etc. dentro de cada pasta).
-- Rode este arquivo no SQL Editor do Supabase.

alter table public.game_categories rename to categories;
alter table public.games rename to materials;

alter table public.categories add column if not exists cover_image_path text;

update public.products
set description = 'Acesso a todo o portal de catequese.'
where code = 'pacote_completo';

notify pgrst, 'reload schema';
