import { redirect } from "next/navigation";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveChildProfileId } from "@/lib/active-profile";
import { hasAccessToGames } from "@/lib/entitlements";
import { LinkButton } from "@/components/ui/Button";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Game, GameCategory, ProductCode } from "@/lib/supabase/types";
import { GamesGrid } from "@/components/member/GamesGrid";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "id" | "name"> | null };

export default async function DashboardPage() {
  const profile = await requireFamily();
  const activeChildId = await getActiveChildProfileId();
  if (!activeChildId) redirect("/perfis");

  const supabase = await createClient();

  const [{ data: entitlements }, { data: product }, { data: child }] = await Promise.all([
    supabase.from("entitlements").select("product_code").eq("family_id", profile.id),
    supabase.from("products").select("*").eq("code", "pacote_completo").maybeSingle(),
    supabase.from("child_profiles").select("*").eq("id", activeChildId).maybeSingle(),
  ]);

  if (!child) redirect("/perfis");

  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  const accessible = hasAccessToGames(entitlementCodes);

  if (!accessible) {
    return <LockedState childName={child.name} product={product} />;
  }

  const [{ data: games }, { data: categories }] = await Promise.all([
    supabase
      .from("games")
      .select("*, game_categories(id, name)")
      .order("sort_order")
      .returns<GameWithCategory[]>(),
    supabase.from("game_categories").select("*").order("sort_order"),
  ]);

  const heroGame = (games ?? [])[0] ?? null;

  return (
    <div className="flex flex-col gap-10">
      <HeroBanner childName={child.name} game={heroGame} />
      <GamesGrid games={games ?? []} categories={categories ?? []} />
    </div>
  );
}

function LockedState({
  childName,
  product,
}: {
  childName: string;
  product: { available_for_sale: boolean; checkout_url: string | null } | null | undefined;
}) {
  const canBuy = product?.available_for_sale && product.checkout_url;

  return (
    <div className="rounded-2xl border border-line bg-card p-10 md:p-16 text-center flex flex-col items-center gap-4">
      <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame">
        Olá, {childName}!
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
          className="mt-2 !bg-flame !border-flame hover:!bg-flame-dark"
        >
          Adquirir acesso
        </LinkButton>
      ) : null}
    </div>
  );
}

function HeroBanner({ childName, game }: { childName: string; game: Game | null }) {
  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[320px] md:min-h-[380px] flex items-end">
      <div className="absolute inset-0">
        {game ? (
          <Cover
            trackSlug={game.id}
            mark={game.title.charAt(0)}
            imageUrl={coverImageUrl(game.cover_image_path)}
            className="absolute inset-0 w-full h-full rounded-none"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: [
                "radial-gradient(circle at 80% 15%, #7a3a1a55, transparent 55%)",
                "linear-gradient(135deg, #2b1810, #4a2313)",
              ].join(", "),
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(20,12,8,0.92) 0%, rgba(20,12,8,0.55) 45%, rgba(20,12,8,0.15) 75%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative p-8 md:p-12 max-w-xl">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
          Olá, {childName}!
        </div>
        <h1 className="font-display italic font-semibold text-[32px] md:text-[42px] text-white leading-tight">
          {game ? game.title : "Bem-vinda ao catálogo"}
        </h1>
        <p className="text-white/75 mt-4 text-[16px] max-w-sm">
          {game?.description ?? "Escolha um jogo educativo para começar a brincar e aprender."}
        </p>
        {game ? (
          <LinkButton
            href={`/jogos/${game.id}`}
            variant="primary"
            className="mt-7 self-start !bg-flame !border-flame hover:!bg-flame-dark"
          >
            Ver jogo
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
}
