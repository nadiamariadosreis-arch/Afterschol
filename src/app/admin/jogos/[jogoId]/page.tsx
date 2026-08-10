import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Tag } from "@/lib/supabase/types";
import {
  deleteJogoAction,
  toggleJogoTagAction,
  updateJogoAction,
  uploadCapaAction,
  uploadPdfAction,
} from "../actions";
import { DeleteJogoButton } from "../DeleteJogoButton";

export default async function EditJogoPage({ params }: { params: Promise<{ jogoId: string }> }) {
  const { jogoId } = await params;
  const supabase = await createClient();

  const [{ data: jogo }, { data: tags }, { data: jogoTags }] = await Promise.all([
    supabase.from("jogos").select("*").eq("id", jogoId).maybeSingle(),
    supabase.from("tags").select("*").order("type").order("name").returns<Tag[]>(),
    supabase.from("jogo_tags").select("tag_id").eq("jogo_id", jogoId),
  ]);

  if (!jogo) notFound();

  const selectedTagIds = new Set((jogoTags ?? []).map((jt) => jt.tag_id));

  return (
    <div className="flex flex-col gap-8">
      <SectionHeading eyebrow="Editar jogo" title={jogo.titulo} />

      <Card>
        <form action={updateJogoAction} className="flex flex-col gap-4">
          <input type="hidden" name="jogoId" value={jogo.id} />
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Título</span>
            <input
              type="text"
              name="titulo"
              defaultValue={jogo.titulo}
              required
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Resumo</span>
            <textarea
              name="resumo"
              defaultValue={jogo.resumo ?? ""}
              rows={2}
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Como jogar</span>
            <textarea
              name="como_jogar"
              defaultValue={jogo.como_jogar ?? ""}
              rows={5}
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Como esse jogo ajuda (explicação pedagógica)</span>
            <textarea
              name="como_ajuda"
              defaultValue={jogo.como_ajuda ?? ""}
              rows={5}
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">URL da videoaula (YouTube ou Vimeo)</span>
            <input
              type="url"
              name="video_url"
              defaultValue={jogo.video_url ?? ""}
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={jogo.published} />
            <span className="text-[14px] text-ink/70">Publicado (visível para membros)</span>
          </label>
          <Button type="submit" variant="primary" className="self-start">
            Salvar alterações
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {(tags ?? []).map((tag) => {
            const checked = selectedTagIds.has(tag.id);
            return (
              <form key={tag.id} action={toggleJogoTagAction} className="inline-block">
                <input type="hidden" name="jogoId" value={jogo.id} />
                <input type="hidden" name="tagId" value={tag.id} />
                <input type="hidden" name="checked" value={checked ? "true" : "false"} />
                <button type="submit" className="inline-block">
                  <Badge tone={checked ? (tag.type === "queixa" ? "coral" : "teal") : "muted"}>
                    {tag.name} {checked ? "✓" : ""}
                  </Badge>
                </button>
              </form>
            );
          })}
          {(tags ?? []).length === 0 ? (
            <p className="text-ink/60">Cadastre tags em /admin/tags primeiro.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h3 className="font-display font-bold text-[20px] text-ink">PDF do jogo</h3>
          <Badge tone={jogo.pdf_path ? "teal" : "coral"}>
            {jogo.pdf_path ? "PDF enviado" : "Sem PDF"}
          </Badge>
        </div>
        <form action={uploadPdfAction} className="flex items-center gap-3 flex-wrap">
          <input type="hidden" name="jogoId" value={jogo.id} />
          <input type="file" name="pdf" accept="application/pdf" required className="text-[14px]" />
          <Button type="submit" variant="secondary">
            {jogo.pdf_path ? "Substituir" : "Enviar"}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h3 className="font-display font-bold text-[20px] text-ink">Capa</h3>
          <Badge tone={jogo.capa_path ? "teal" : "coral"}>
            {jogo.capa_path ? "Capa enviada" : "Sem capa"}
          </Badge>
        </div>
        <form action={uploadCapaAction} className="flex items-center gap-3 flex-wrap">
          <input type="hidden" name="jogoId" value={jogo.id} />
          <input type="file" name="capa" accept="image/png,image/jpeg" required className="text-[14px]" />
          <Button type="submit" variant="secondary">
            {jogo.capa_path ? "Substituir" : "Enviar"}
          </Button>
        </form>
      </Card>

      <form action={deleteJogoAction} className="self-start">
        <input type="hidden" name="jogoId" value={jogo.id} />
        <DeleteJogoButton />
      </form>
    </div>
  );
}
