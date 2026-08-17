import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToGames } from "@/lib/entitlements";
import { LinkButton } from "@/components/ui/Button";
import type { Game, GameCategory, ProductCode } from "@/lib/supabase/types";
import { GamesGrid } from "@/components/member/GamesGrid";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "id" | "name"> | null };

export default async function DashboardPage() {
  const profile = await requireFamily();
  const supabase = await createClient();

  const [{ data: entitlements }, { data: product }] = await Promise.all([
    supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
    supabase.from("products").select("*").eq("code", "pacote_completo").maybeSingle(),
  ]);

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  const accessible = hasAccessToGames(entitlementCodes);
  const greeting = profile.full_name ?? profile.email;

  if (!accessible) {
    return <LockedState greeting={greeting} product={product} />;
  }

  const [{ data: games }, { data: categories }] = await Promise.all([
    supabase
      .from("games")
      .select("*, game_categories(id, name)")
      .order("sort_order")
      .returns<GameWithCategory[]>(),
    supabase.from("game_categories").select("*").order("sort_order"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <HeroBanner greeting={greeting} />
      <GamesGrid games={games ?? []} categories={categories ?? []} />
    </div>
  );
}

function LockedState({
  greeting,
  product,
}: {
  greeting: string;
  product: { available_for_sale: boolean; checkout_url: string | null } | null | undefined;
}) {
  const canBuy = product?.available_for_sale && product.checkout_url;

  return (
    <div className="rounded-2xl border border-line bg-card p-10 md:p-16 text-center flex flex-col items-center gap-4">
      <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame">
        Olá, {greeting}!
      </div>
      <h1 className="font-display italic font-semibold text-[32px] text-ink">
        Seu catálogo de jogos ainda não foi liberado
      </h1>
      <p className="text-ink/60 max-w-md">
        Assim que o acesso for confirmado, todos os jogos aparecem aqui.
      </p>
      {canBuy ? (
        <LinkButton
          href={product!.checkout_url!}
          variant="primary"
          className="mt-2 !bg-navy !border-navy hover:!bg-ink"
        >
          Adquirir acesso
        </LinkButton>
      ) : null}
    </div>
  );
}

function HeroBanner({ greeting }: { greeting: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-line grid md:grid-cols-[1.2fr_1fr] items-center">
      <div className="p-8 md:p-12">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
          Olá, {greeting}!
        </div>
        <h1 className="font-heading font-bold text-[30px] md:text-[38px] text-navy leading-[1.15]">
          Jogos que desenvolvem habilidades para a vida toda.
        </h1>
        <p className="text-ink/60 mt-4 text-[16px] max-w-sm">
          Diversão com propósito. Formação que fica.
        </p>
        <a
          href="#jogos"
          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-body font-semibold text-[15px] bg-navy text-white hover:bg-ink transition-colors mt-7"
        >
          Explorar jogos
        </a>
      </div>

      <div className="relative hidden md:block h-full min-h-[300px]">
        <HeroIllustration />
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute w-16 h-16 rounded-full"
        style={{ background: "#e4ecf7", top: "12%", left: "12%" }}
      />
      <div
        className="absolute w-10 h-10 rounded-full"
        style={{ background: "#faf0d6", top: "68%", left: "18%" }}
      />
      <div
        className="absolute w-12 h-12 rounded-full"
        style={{ background: "#f2e0e6", top: "20%", left: "78%" }}
      />
      <div
        className="absolute w-8 h-8 rounded-full"
        style={{ background: "#e7f1e2", top: "72%", left: "80%" }}
      />

      <div
        className="absolute rounded-2xl shadow-lg flex items-center justify-center"
        style={{
          width: "180px",
          height: "180px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-4deg)",
          background: "linear-gradient(135deg, #f7e3da, #f2e0e6)",
        }}
      >
        <svg viewBox="0 0 48 48" className="w-16 h-16" style={{ color: "#a15230" }}>
          <path
            d="M6 12c6-3 12-2 18 1v25c-6-3-12-4-18-1V12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M42 12c-6-3-12-2-18 1v25c6-3 12-4 18-1V12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M24 13v25" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}
