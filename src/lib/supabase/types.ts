import type {
  AcompanharData,
  AvaliarData,
  FazerAcontecerData,
  PlanejarData,
  ProcessoKey,
} from "@/lib/apfa/types";

export type UserRole = "member" | "admin";

export type Profile = {
  id: string;
  email: string;
  family_name: string | null;
  role: UserRole;
  paid: boolean;
  created_at: string;
};

export type CycleRow = {
  id: string;
  family_id: string;
  year: number;
  month: number;
  percentuais: Record<ProcessoKey, number>;
  avaliar: AvaliarData | null;
  planejar: PlanejarData | null;
  fazer_acontecer: FazerAcontecerData | null;
  acompanhar: AcompanharData | null;
  created_at: string;
  updated_at: string;
};

type Relationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
      } & Relationships;
      cycles: {
        Row: CycleRow;
        Insert: Partial<CycleRow> & { family_id: string; year: number; month: number };
        Update: Partial<CycleRow>;
      } & Relationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
