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
    <div className="rounded-sm border border-line bg-card p-10 md:p-16 text-center flex flex-col items-center gap-4">
      <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss">
        Olá, {childName}!
      </div>
      <h1 className="font-display italic font-semibold text-[32px] text-ink">
        Seu catálogo de jogos ainda não foi liberado
      </h1>
      <p className="text-ink/60 max-w-md">
        Assim que o acesso for confirmado, todos os jogos aparecem aqui.
      </p>
      {canBuy ? (
        <LinkButton href={product!.checkout_url!} variant="primary" className="mt-2">
          Adquirir acesso
        </LinkButton>
      ) : null}
    </div>
  );
}

function HeroBanner({ childName, game }: { childName: string; game: Game | null }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-line grid md:grid-cols-[1.1fr_1fr] bg-card">
      <div
        className="p-8 md:p-12 flex flex-col justify-center"
        style={{
          background: [
            "radial-gradient(circle at 90% 10%, #eef2ec, transparent 55%)",
            "linear-gradient(120deg, #ffffff, #f6f6f4)",
          ].join(", "),
        }}
      >
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3">
          Olá, {childName}!
        </div>
        <h1 className="font-display italic font-semibold text-[34px] md:text-[40px] text-ink leading-tight">
          {game ? game.title : "Bem-vinda ao catálogo"}
        </h1>
        <p className="text-ink/70 mt-4 text-[16px] max-w-sm">
          {game?.description ?? "Escolha um jogo educativo para começar a brincar e aprender."}
        </p>
        {game ? (
          <LinkButton href={`/jogos/${game.id}`} variant="primary" className="mt-7 self-start">
            Ver jogo
          </LinkButton>
        ) : null}
      </div>

      <div className="relative h-56 md:h-auto">
        {game ? (
          <Cover
            trackSlug={game.id}
            mark={game.title.charAt(0)}
            imageUrl={coverImageUrl(game.cover_image_path)}
            className="absolute inset-0 w-full h-full rounded-none"
          />
        ) : null}
      </div>
    </div>
  );
}
