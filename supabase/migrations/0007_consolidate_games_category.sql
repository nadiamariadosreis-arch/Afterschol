-- Remove as categorias de habilidades cognitivas herdadas da fase de
-- catálogo de jogos (Atenção, Memória, Raciocínio Lógico, Autocontrole,
-- Linguagem) e deixa apenas uma categoria "Jogos Católicos", pronta para
-- receber os jogos que serão cadastrados depois.
-- Rode este arquivo no SQL Editor do Supabase.

do $$
declare
  jogos_id uuid;
begin
  select id into jogos_id from public.categories where name = 'Atenção';

  if jogos_id is not null then
    update public.categories
    set name = 'Jogos Católicos', sort_order = 999
    where id = jogos_id;

    update public.materials
    set category_id = jogos_id
    where category_id in (
      select id from public.categories
      where name in ('Memória', 'Raciocínio Lógico', 'Autocontrole', 'Linguagem')
    );

    delete from public.categories
    where name in ('Memória', 'Raciocínio Lógico', 'Autocontrole', 'Linguagem');
  end if;
end $$;

notify pgrst, 'reload schema';
