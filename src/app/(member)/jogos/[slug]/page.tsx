import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { PdfViewer } from "@/components/member/PdfViewer";
import { toEmbedUrl } from "@/lib/video";
import type { Jogo, Tag } from "@/lib/supabase/types";

type JogoWithTags = Jogo & { jogo_tags: { tags: Tag | null }[] };

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: jogo } = await supabase
    .from("jogos")
    .select("*, jogo_tags(tags(*))")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<JogoWithTags>();

  if (!jogo) notFound();

  const tags = jogo.jogo_tags.map((jt) => jt.tags).filter((t): t is Tag => t !== null);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} tone={tag.type === "queixa" ? "coral" : "teal"}>
              {tag.name}
            </Badge>
          ))}
        </div>
        <h1 className="font-display font-bold text-[32px] text-ink">{jogo.titulo}</h1>
        {jogo.resumo ? <p className="text-ink/70 text-[16px]">{jogo.resumo}</p> : null}
      </div>

      {jogo.video_url ? (
        <div className="aspect-video rounded-2xl overflow-hidden border border-line bg-card">
          <iframe
            src={toEmbedUrl(jogo.video_url)}
            title={`Videoaula: ${jogo.titulo}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {jogo.pdf_path ? (
        <Card>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-display font-bold text-[20px] text-ink">Material do jogo (PDF)</h3>
            <LinkButton href={`/api/pdf/${jogo.id}?mode=download`} variant="primary">
              Baixar PDF
            </LinkButton>
          </div>
        </Card>
      ) : null}

      {jogo.como_jogar ? (
        <Card>
          <h3 className="font-display font-bold text-[20px] text-ink mb-3">Como jogar</h3>
          <div className="text-ink/80 whitespace-pre-line leading-relaxed">{jogo.como_jogar}</div>
        </Card>
      ) : null}

      {jogo.como_ajuda ? (
        <Card className="bg-teal/5 border-teal/30">
          <h3 className="font-display font-bold text-[20px] text-ink mb-3">
            Como esse jogo ajuda
          </h3>
          <div className="text-ink/80 whitespace-pre-line leading-relaxed">{jogo.como_ajuda}</div>
        </Card>
      ) : null}

      {jogo.pdf_path ? <PdfViewer src={`/api/pdf/${jogo.id}`} title={jogo.titulo} /> : null}
    </div>
  );
}
