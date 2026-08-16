import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/member/Cover";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { MarkdownHint, GUIDE_MARKDOWN_PLACEHOLDER } from "@/components/admin/MarkdownHint";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Game, GameCategory } from "@/lib/supabase/types";
import { createGameAction, deleteGameAction, updateGameAction } from "./actions";

type GameWithCategory = Game & { game_categories: Pick<GameCategory, "name"> | null };

export default async function GamesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: saveError } = await searchParams;
  const supabase = await createClient();

  const [{ data: games }, { data: categories }] = await Promise.all([
    supabase
      .from("games")
      .select("*, game_categories(name)")
      .order("sort_order")
      .returns<GameWithCategory[]>(),
    supabase.from("game_categories").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Jogos" title="Catálogo de Jogos" />

      {saveError ? (
        <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
          <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
          <p className="text-ink/70 text-[13px] mt-1">{saveError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 mb-10">
        {(games ?? []).map((game) => (
          <Card key={game.id} className="flex flex-col md:flex-row gap-6">
            <Cover
              trackSlug={game.id}
              mark={game.title.charAt(0)}
              imageUrl={coverImageUrl(game.cover_image_path)}
              className="w-full md:w-40 h-40 shrink-0 rounded-sm"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <h3 className="font-heading font-semibold text-[20px] text-ink">
                  {game.title}
                </h3>
                <Badge tone={game.pdf_path ? "moss" : "terracotta"}>
                  {game.pdf_path ? "PDF enviado" : "Sem PDF"}
                </Badge>
              </div>

              <form action={updateGameAction} className="grid md:grid-cols-3 gap-3 items-end">
                <input type="hidden" name="gameId" value={game.id} />
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Título</span>
                  <input
                    type="text"
                    name="title"
                    defaultValue={game.title}
                    required
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Categoria</span>
                  <select
                    name="categoryId"
                    defaultValue={game.category_id ?? ""}
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  >
                    <option value="">Sem categoria</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Faixa etária</span>
                  <input
                    type="text"
                    name="ageRange"
                    defaultValue={game.age_range ?? ""}
                    placeholder="Ex: 3 a 5 anos"
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>

                <label className="flex flex-col gap-2 md:col-span-3">
                  <span className="text-[14px] text-ink/70">Descrição curta</span>
                  <input
                    type="text"
                    name="description"
                    defaultValue={game.description ?? ""}
                    placeholder="Uma frase sobre o jogo, aparece no card do catálogo."
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Vídeo — como jogar (URL)</span>
                  <input
                    type="url"
                    name="videoUrl"
                    defaultValue={game.video_url ?? ""}
                    placeholder="https://..."
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Capa (imagem)</span>
                  <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" className="text-[13px]" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Jogo (PDF)</span>
                  <PdfUploadField
                    name="pdfPath"
                    path={`jogos/${game.id}.pdf`}
                    hasExisting={!!game.pdf_path}
                  />
                </label>

                <label className="flex flex-col gap-2 md:col-span-3">
                  <span className="text-[14px] text-ink/70">Instruções (Markdown)</span>
                  <MarkdownHint />
                  <textarea
                    name="instructions"
                    defaultValue={game.instructions ?? ""}
                    rows={10}
                    placeholder={GUIDE_MARKDOWN_PLACEHOLDER}
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                  />
                </label>

                <Button type="submit" variant="secondary" className="md:col-span-3 md:justify-self-start">
                  Salvar
                </Button>
              </form>

              <form action={deleteGameAction} className="mt-3">
                <input type="hidden" name="gameId" value={game.id} />
                <button type="submit" className="text-[12px] text-terracotta underline underline-offset-2">
                  Remover este jogo
                </button>
              </form>
            </div>
          </Card>
        ))}

        {(games ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhum jogo cadastrado ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Adicionar novo jogo
        </h3>
        <form action={createGameAction} className="grid md:grid-cols-3 gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Título</span>
            <input
              type="text"
              name="title"
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Categoria</span>
            <select
              name="categoryId"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            >
              <option value="">Sem categoria</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Faixa etária</span>
            <input
              type="text"
              name="ageRange"
              placeholder="Ex: 3 a 5 anos"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-3">
            <span className="text-[14px] text-ink/70">Descrição curta</span>
            <input
              type="text"
              name="description"
              placeholder="Uma frase sobre o jogo, aparece no card do catálogo."
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Vídeo — como jogar (URL, opcional)</span>
            <input
              type="url"
              name="videoUrl"
              placeholder="https://..."
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Capa (imagem, opcional)</span>
            <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" className="text-[13px]" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Jogo (PDF, opcional)</span>
            <PdfUploadField name="pdfPath" path={`jogos/${randomUUID()}.pdf`} />
          </label>

          <label className="flex flex-col gap-2 md:col-span-3">
            <span className="text-[14px] text-ink/70">Instruções (Markdown, opcional)</span>
            <MarkdownHint />
            <textarea
              name="instructions"
              rows={10}
              placeholder={GUIDE_MARKDOWN_PLACEHOLDER}
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
            />
          </label>

          <Button type="submit" variant="primary" className="md:col-span-3">
            Adicionar jogo
          </Button>
        </form>
      </Card>
    </div>
  );
}
