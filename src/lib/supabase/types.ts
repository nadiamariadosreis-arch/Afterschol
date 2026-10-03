export type UserRole = "member" | "admin";
// Known shortcut types get autocomplete; tags.type is free text in the
// database so new categories don't require a migration — see tagStyle.ts.
export type TagType = "queixa" | "virtude" | "idade" | "tempo" | "tipo" | "modo" | (string & {});

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Tag = {
  id: string;
  type: TagType;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Jogo = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  como_jogar: string | null;
  como_ajuda: string | null;
  video_url: string | null;
  pdf_path: string | null;
  capa_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type JogoTag = {
  jogo_id: string;
  tag_id: string;
};

export type Favorito = {
  member_id: string;
  jogo_id: string;
  created_at: string;
};

type Relationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      } & Relationships;
      tags: {
        Row: Tag;
        Insert: Partial<Tag>;
        Update: Partial<Tag>;
      } & Relationships;
      jogos: {
        Row: Jogo;
        Insert: Partial<Jogo>;
        Update: Partial<Jogo>;
      } & Relationships;
      jogo_tags: {
        Row: JogoTag;
        Insert: Partial<JogoTag>;
        Update: Partial<JogoTag>;
      } & Relationships;
      favoritos: {
        Row: Favorito;
        Insert: Partial<Favorito>;
        Update: Partial<Favorito>;
      } & Relationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
