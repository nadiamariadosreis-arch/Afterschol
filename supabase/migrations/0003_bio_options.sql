-- Guarda as variações de bio geradas pela IA, para o usuário escolher entre elas.
alter table identities add column if not exists bio_options jsonb not null default '[]'::jsonb;
