import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasAccessToGames } from "@/lib/entitlements";
import { toEmbedUrl } from "@/lib/video";
import { Cover } from "@/components/member/Cover";
import { coverImageUrl } from "@/lib/supabase/storage";
import { GuideContent } from "@/components/member/GuideContent";
import type { Game, GameCategory, ProductCode } from "@/lib/supabase/types";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "name"> | null };

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const profile = await requireFamily();

  const supabase = await createClient();

  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("product_code")
    .eq("family_id", profile.id);
  const entitlementCodes = (entitlements ?? []).map((e) => e.product_code) as ProductCode[];
  if (!hasAccessToGames(entitlementCodes)) redirect("/dashboard");

  const { data: game } = await supabase
    .from("games")
    .select("*, game_categories(name)")
    .eq("id", gameId)
    .returns<GameWithCategory[]>()
    .maybeSingle();
  if (!game) notFound();

  return (
    <div className="flex flex-col gap-8">
      <Link href="/dashboard" className="text-flame text-[14px] hover:underline underline-offset-4 w-fit">
        ← Voltar ao catálogo
      </Link>

      <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
          <Cover
            trackSlug={game.id}
            mark={game.title.charAt(0)}
            imageUrl={coverImageUrl(game.cover_image_path)}
            className="absolute inset-0 w-full h-full rounded-none"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {game.game_categories ? (
              <span className="bg-flame text-white text-[12px] tracking-[0.08em] uppercase font-semibold rounded-full px-4 py-1">
                {game.game_categories.name}
              </span>
            ) : null}
            {game.age_range ? (
              <span className="border border-line text-ink/60 text-[13px] rounded-full px-4 py-1">
                {game.age_range}
              </span>
            ) : null}
          </div>

          <h1 className="font-display italic font-semibold text-[32px] md:text-[38px] text-ink leading-tight">
            {game.title}
          </h1>

          {game.description ? (
            <p className="text-ink/70 text-[16px] max-w-xl">{game.description}</p>
          ) : null}

          {game.pdf_path ? (
            <a
              href={`/api/pdf-jogo/${game.id}?mode=download`}
              className="inline-flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-body text-[15px] tracking-wide bg-flame text-white hover:bg-flame-dark border border-flame transition-colors duration-150 w-fit"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M10 3v10" strokeLinecap="round" />
                <path d="M6 9.5 10 13.5 14 9.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16.5h12" strokeLinecap="round" />
              </svg>
              Baixar Jogo
            </a>
          ) : null}
        </div>
      </div>

      {game.video_url ? (
        <section className="border border-line rounded-2xl bg-card overflow-hidden">
          <div className="p-5 border-b border-line">
            <h2 className="font-heading font-semibold text-[18px] text-ink">Como jogar</h2>
          </div>
          <div className="p-5">
            <div className="aspect-video rounded-sm overflow-hidden border border-line">
              <iframe
                src={toEmbedUrl(game.video_url)}
                title="Como jogar"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      ) : null}

      {game.instructions ? <GuideContent markdown={game.instructions} /> : null}
    </div>
  );
}
