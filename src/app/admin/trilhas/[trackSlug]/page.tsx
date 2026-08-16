import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/member/Cover";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { MarkdownHint, GUIDE_MARKDOWN_PLACEHOLDER } from "@/components/admin/MarkdownHint";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Virtue, Week } from "@/lib/supabase/types";
import { createWeekAction, updateWeekAction, uploadTrackCoverAction } from "../actions";

type WeekWithVirtue = Week & { virtues: Pick<Virtue, "name" | "number"> | null };

export default async function TrackWeeksAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ trackSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { trackSlug } = await params;
  const { error: saveError } = await searchParams;
  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", trackSlug)
    .maybeSingle();
  if (!track) notFound();

  const [{ data: weeks }, { data: virtues }] = await Promise.all([
    supabase
      .from("weeks")
      .select("*, virtues(name, number)")
      .eq("track_id", track.id)
      .order("week_number")
      .returns<WeekWithVirtue[]>(),
    supabase.from("virtues").select("*").order("number"),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Trilhas e Semanas" title={track.name} />

      {saveError ? (
        <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
          <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
          <p className="text-ink/70 text-[13px] mt-1">{saveError}</p>
        </div>
      ) : null}

      <Card className="mb-10 flex flex-col md:flex-row gap-6 items-start">
        <Cover
          trackSlug={track.slug}
          mark={track.name.charAt(0)}
          imageUrl={coverImageUrl(track.cover_image_path)}
          className="w-40 h-40 shrink-0 rounded-sm"
        />
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-[20px] text-ink mb-1">
            Capa da trilha
          </h3>
          <p className="text-ink/60 text-[14px] mb-4">
            Ilustração usada nos cards desta trilha (dashboard, biblioteca e
            lista de semanas). Sem uma imagem enviada, uma capa gerada
            automaticamente é usada no lugar.
          </p>
          <form action={uploadTrackCoverAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="trackId" value={track.id} />
            <input type="hidden" name="trackSlug" value={trackSlug} />
            <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" required className="text-[14px]" />
            <Button type="submit" variant="secondary">
              {track.cover_image_path ? "Substituir" : "Enviar"}
            </Button>
          </form>
        </div>
      </Card>

      <div className="flex flex-col gap-4 mb-10">
        {(weeks ?? []).map((week) => (
          <Card key={week.id}>
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <h3 className="font-heading font-semibold text-[20px] text-ink">
                Semana {week.week_number} — {week.virtues?.name}
              </h3>
              <Badge tone={week.activity_pdf_path ? "moss" : "terracotta"}>
                {week.activity_pdf_path ? "Atividade enviada" : "Sem atividade"}
              </Badge>
            </div>

            <form action={updateWeekAction} className="grid md:grid-cols-3 gap-3 items-end">
              <input type="hidden" name="weekId" value={week.id} />
              <input type="hidden" name="trackSlug" value={trackSlug} />
              <label className="flex flex-col gap-2">
                <span className="text-[14px] text-ink/70">Data de liberação</span>
                <input
                  type="date"
                  name="releaseDate"
                  defaultValue={week.release_date}
                  required
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] text-ink/70">Vídeo-aula (URL)</span>
                <input
                  type="url"
                  name="videoUrl"
                  defaultValue={week.video_url ?? ""}
                  placeholder="https://..."
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] text-ink/70">Atividades da Semana (PDF)</span>
                <PdfUploadField
                  name="activityPath"
                  path={`atividades/${week.id}.pdf`}
                  hasExisting={!!week.activity_pdf_path}
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-3">
                <span className="text-[14px] text-ink/70">Guia dos Pais (Markdown)</span>
                <MarkdownHint />
                <textarea
                  name="description"
                  defaultValue={week.description ?? ""}
                  rows={12}
                  placeholder={GUIDE_MARKDOWN_PLACEHOLDER}
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                />
              </label>
              <Button type="submit" variant="secondary" className="md:col-span-3 md:justify-self-start">
                Salvar
              </Button>
            </form>
          </Card>
        ))}

        {(weeks ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhuma semana cadastrada nesta trilha ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Adicionar nova semana
        </h3>
        <form
          action={createWeekAction}
          className="grid md:grid-cols-2 gap-4"
        >
          <input type="hidden" name="trackId" value={track.id} />
          <input type="hidden" name="trackSlug" value={trackSlug} />

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nº da semana (nesta trilha)</span>
            <input
              type="number"
              name="weekNumber"
              min={1}
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Virtude</span>
            <select
              name="virtueId"
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            >
              <option value="">Selecione…</option>
              {(virtues ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.number}. {v.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Data de liberação</span>
            <input
              type="date"
              name="releaseDate"
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Vídeo-aula (URL, opcional)</span>
            <input
              type="url"
              name="videoUrl"
              placeholder="https://..."
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[14px] text-ink/70">Atividades da Semana (PDF, opcional)</span>
            <PdfUploadField name="activityPath" path={`atividades/${randomUUID()}.pdf`} />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[14px] text-ink/70">Guia dos Pais (Markdown, opcional)</span>
            <MarkdownHint />
            <textarea
              name="description"
              rows={12}
              placeholder={GUIDE_MARKDOWN_PLACEHOLDER}
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
            />
          </label>

          <Button type="submit" variant="primary" className="md:col-span-2">
            Adicionar semana
          </Button>
        </form>
      </Card>
    </div>
  );
}
