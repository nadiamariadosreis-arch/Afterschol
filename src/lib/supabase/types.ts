export type UserRole = "family" | "admin";
export type TrackLevel = "inicial" | "intermediario" | "avancado";
export type ProductCode =
  | "trilha_letras"
  | "trilha_silabas"
  | "trilha_gramatica"
  | "pacote_completo";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type ChildProfile = {
  id: string;
  family_id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  code: ProductCode;
  name: string;
  description: string | null;
  price_cents: number | null;
  kiwify_product_id: string | null;
  available_for_sale: boolean;
  checkout_url: string | null;
  created_at: string;
};

export type Entitlement = {
  id: string;
  family_id: string;
  product_code: ProductCode;
  granted_at: string;
  source: "manual" | "kiwify";
};

export type Track = {
  id: string;
  slug: string;
  name: string;
  level: TrackLevel;
  product_code: ProductCode;
  sort_order: number;
  cover_image_path: string | null;
  created_at: string;
};

export type Virtue = {
  id: string;
  number: number;
  name: string;
  booklet_pdf_path: string | null;
  created_at: string;
};

export type Week = {
  id: string;
  track_id: string;
  virtue_id: string;
  week_number: number;
  release_date: string;
  activity_pdf_path: string | null;
  video_url: string | null;
  description: string | null;
  created_at: string;
};

export type Progress = {
  id: string;
  child_profile_id: string;
  week_id: string;
  completed_at: string | null;
};

export type WeekDay = {
  id: string;
  week_id: string;
  day_number: number;
  label: string;
  content: string | null;
  pdf_path: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  cover_image_path: string | null;
  sort_order: number;
  created_at: string;
};

export type Material = {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  age_range: string | null;
  cover_image_path: string | null;
  video_url: string | null;
  pdf_path: string | null;
  instructions: string | null;
  sort_order: number;
  created_at: string;
};

export type IgAccount = {
  id: string;
  handle: string;
  name: string;
  voice: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type IgTheme = {
  id: string;
  account_id: string;
  position: number;
  name: string;
  created_at: string;
};

export type IgPostFormat = "carrossel" | "reels" | "estatico" | "stories";

export type IgPost = {
  id: string;
  account_id: string;
  theme_id: string;
  position: number;
  title: string;
  format: IgPostFormat;
  scheduled_date: string | null;
  notes: string | null;
  uses_lead_magnet: boolean;
  lead_magnet_description: string | null;
  uses_manychat: boolean;
  manychat_keyword: string | null;
  sells_product: boolean;
  product_name: string | null;
  art_done: boolean;
  caption_done: boolean;
  lead_magnet_done: boolean;
  manychat_done: boolean;
  product_hosted_done: boolean;
  checkout_done: boolean;
  published: boolean;
  published_at: string | null;
  post_url: string | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  new_followers: number | null;
  mc_messages_sent: number | null;
  mc_link_clicks: number | null;
  mc_leads: number | null;
  sales: number | null;
  revenue_cents: number | null;
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
      child_profiles: {
        Row: ChildProfile;
        Insert: Omit<ChildProfile, "id" | "created_at">;
        Update: Partial<ChildProfile>;
      } & Relationships;
      products: {
        Row: Product;
        Insert: Partial<Product>;
        Update: Partial<Product>;
      } & Relationships;
      entitlements: {
        Row: Entitlement;
        Insert: Omit<Entitlement, "id" | "granted_at">;
        Update: Partial<Entitlement>;
      } & Relationships;
      tracks: {
        Row: Track;
        Insert: Partial<Track>;
        Update: Partial<Track>;
      } & Relationships;
      virtues: {
        Row: Virtue;
        Insert: Partial<Virtue>;
        Update: Partial<Virtue>;
      } & Relationships;
      weeks: {
        Row: Week;
        Insert: Partial<Week>;
        Update: Partial<Week>;
      } & Relationships;
      progress: {
        Row: Progress;
        Insert: Omit<Progress, "id">;
        Update: Partial<Progress>;
      } & Relationships;
      week_days: {
        Row: WeekDay;
        Insert: Partial<WeekDay>;
        Update: Partial<WeekDay>;
      } & Relationships;
      categories: {
        Row: Category;
        Insert: Partial<Category>;
        Update: Partial<Category>;
      } & Relationships;
      materials: {
        Row: Material;
        Insert: Partial<Material>;
        Update: Partial<Material>;
      } & Relationships;
      ig_accounts: {
        Row: IgAccount;
        Insert: Partial<IgAccount>;
        Update: Partial<IgAccount>;
      } & Relationships;
      ig_themes: {
        Row: IgTheme;
        Insert: Partial<IgTheme>;
        Update: Partial<IgTheme>;
      } & Relationships;
      ig_posts: {
        Row: IgPost;
        Insert: Partial<IgPost>;
        Update: Partial<IgPost>;
      } & Relationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
