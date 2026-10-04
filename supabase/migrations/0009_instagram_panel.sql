-- Painel de controle do Instagram — perfis, matriz de conteúdo 6x5
-- (6 temas × 5 posts), checklist de produção e métricas (post + ManyChat).
-- Uso exclusivo da administradora. Rode este arquivo no SQL Editor do Supabase.

create table public.ig_accounts (
  id uuid primary key default gen_random_uuid(),
  handle text not null, -- @ do perfil, sem o "@"
  name text not null,
  voice text, -- a "linguagem" do perfil: tom, público, estilo
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.ig_themes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.ig_accounts (id) on delete cascade,
  position integer not null check (position between 1 and 6),
  name text not null default '',
  created_at timestamptz not null default now(),
  unique (account_id, position)
);

create table public.ig_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.ig_accounts (id) on delete cascade,
  theme_id uuid not null references public.ig_themes (id) on delete cascade,
  position integer not null check (position between 1 and 5),
  title text not null default '',
  format text not null default 'carrossel', -- carrossel | reels | estatico | stories
  scheduled_date date,
  notes text,

  -- O que esse post precisa (define quais etapas do checklist se aplicam)
  uses_lead_magnet boolean not null default false,
  lead_magnet_description text,
  uses_manychat boolean not null default false,
  manychat_keyword text,
  sells_product boolean not null default false,
  product_name text,

  -- Checklist de produção
  art_done boolean not null default false,
  caption_done boolean not null default false,
  lead_magnet_done boolean not null default false,
  manychat_done boolean not null default false,
  product_hosted_done boolean not null default false,
  checkout_done boolean not null default false,
  published boolean not null default false,
  published_at date,
  post_url text,

  -- Métricas do post
  reach integer,
  likes integer,
  comments integer,
  saves integer,
  shares integer,
  new_followers integer,

  -- Métricas do ManyChat
  mc_messages_sent integer, -- pessoas que receberam a mensagem
  mc_link_clicks integer,
  mc_leads integer,
  sales integer,
  revenue_cents integer,

  created_at timestamptz not null default now(),
  unique (theme_id, position)
);

create index ig_posts_account_idx on public.ig_posts (account_id);
create index ig_posts_scheduled_idx on public.ig_posts (account_id, scheduled_date);

alter table public.ig_accounts enable row level security;
alter table public.ig_themes enable row level security;
alter table public.ig_posts enable row level security;

create policy "ig_accounts: admin only" on public.ig_accounts
  for all using (public.is_admin()) with check (public.is_admin());
create policy "ig_themes: admin only" on public.ig_themes
  for all using (public.is_admin()) with check (public.is_admin());
create policy "ig_posts: admin only" on public.ig_posts
  for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
