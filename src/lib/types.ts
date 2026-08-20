export type ContentFormat = "reels" | "carrossel" | "foto_unica" | "stories";

export type ProfileStatus =
  | "nicho"
  | "identidade"
  | "metodo"
  | "conteudo"
  | "calendario"
  | "ativo";

export interface Profile {
  id: string;
  user_id: string;
  title: string;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface NicheSuggestion {
  niche: string;
  audience: string;
  rationale: string;
  avoid: string;
}

export interface Niche {
  id: string;
  profile_id: string;
  user_id: string;
  input_interest: string;
  suggestions: NicheSuggestion[];
  chosen_niche: string | null;
  chosen_audience: string | null;
  chosen_rationale: string | null;
  created_at: string;
}

export interface Identity {
  id: string;
  profile_id: string;
  user_id: string;
  username_suggestion: string | null;
  bio: string | null;
  bio_options: string[];
  value_proposition: string | null;
  tone_of_voice: string | null;
  color_palette: string[];
  content_pillars: string[];
  created_at: string;
  updated_at: string;
}

export interface MethodPillar {
  name: string;
  description: string;
  processes: string[];
}

export interface Method {
  id: string;
  profile_id: string;
  user_id: string;
  desired_result: string | null;
  notes: string | null;
  pillars: MethodPillar[];
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface MethodSource {
  id: string;
  method_id: string;
  profile_id: string;
  user_id: string;
  title: string;
  file_path: string;
  summary: string | null;
  created_at: string;
}

export interface ContentPiece {
  id: string;
  profile_id: string;
  user_id: string;
  format: ContentFormat;
  theme: string;
  hook: string | null;
  script: string | null;
  caption: string | null;
  grid_order: number | null;
  scheduled_date: string | null;
  status: "pauta" | "agendado" | "publicado";
  created_at: string;
}
