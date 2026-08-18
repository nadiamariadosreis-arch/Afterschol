-- Cria as categorias (abas) que você já usa no app "Catequese em Ação",
-- com base nos prints que você me mandou. Idempotente: só insere as que
-- ainda não existem, então pode rodar mais de uma vez sem duplicar nada.
-- "Jogos Católicos" não entra aqui porque já foi criada na migração 0007.
-- Rode este arquivo no SQL Editor do Supabase.

insert into public.categories (name, sort_order)
select v.name, v.sort_order
from (values
  ('Crianças de 2-4 anos', 1),
  ('Crianças de 4-6 anos', 2),
  ('Pré Eucaristia', 3),
  ('Eucaristia', 4),
  ('Área de Estudo Bíblico', 5),
  ('Apostilas de Catequese Semanal', 6),
  ('Encontros Prontos para Diversos Temas', 7),
  ('Materiais sobre a Santa Missa', 8),
  ('Recurso Santo Terço', 9),
  ('Orações para Todas as Idades', 10),
  ('Catequese: Temas Marianos', 11),
  ('Memorização', 12),
  ('Flashcards de Memorização', 13),
  ('Avaliações para Todas as Idades', 14),
  ('Decorando a Sala de Catequese', 15),
  ('Lembrancinhas', 16),
  ('Natal', 17),
  ('Dinâmicas', 18)
) as v(name, sort_order)
where not exists (
  select 1 from public.categories c where c.name = v.name
);

notify pgrst, 'reload schema';
