import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Cover } from "@/components/member/Cover";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { coverImageUrl } from "@/lib/supabase/storage";
import type { Virtue, Week, WeekDay } from "@/lib/supabase/types";
import {
  createWeekAction,
  createWeekDayAction,
  deleteWeekDayAction,
  updateWeekAction,
  updateWeekDayAction,
  uploadTrackCoverAction,
} from "../actions";

type WeekWithVirtue = Week & { virtues: Pick<Virtue, "name" | "number"> | null };

const GUIDE_PLACEHOLDER = `# Guia dos Pais — Semana 1
Volume 1 — Gratidão | Livro: "O Dia que Quase Foi Ruim"

Bem-vindo(a) à primeira semana da nossa trilha!

Parágrafo de introdução, texto livre.

> Aviso importante que aparece destacado (ex: este material complementa, não substitui, a catequese paroquial).

## O que seu filho vai viver esta semana
- Primeiro ponto
- Segundo ponto

## Como usar este material
- Primeiro ponto
- Segundo ponto

## Materiais desta semana
- Livrinho
- Cartão tal

## A semana, dia a dia
| Dia | O que fazer |
| --- | --- |
| Segunda | ... |
| Terça | ... |

## Uma palavra final
Mensagem de encorajamento para fechar a semana.`;

function GuideMarkdownHint() {
  return (
    <p className="text-ink/50 text-[13px]">
      <code># Título</code> vira o cabeçalho, a linha logo abaixo vira o
      subtítulo, <code>&gt; texto</code> vira um aviso destacado,{" "}
      <code>## Seção</code> começa uma seção nova (listas curtas viram
      etiquetas, listas longas viram lista com ícone, tabelas com{" "}
      <code>|</code> viram tabela), e a última seção sempre vira o bloco de
      encerramento.
    </p>
  );
}

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

  const weekIds = (weeks ?? []).map((w) => w.id);
  const { data: weekDays } =
    weekIds.length > 0
      ? await supabase
          .from("week_days")
          .select("*")
          .in("week_id", weekIds)
          .order("day_number")
          .returns<WeekDay[]>()
      : { data: [] as WeekDay[] };

  const daysByWeek = new Map<string, WeekDay[]>();
  for (const day of weekDays ?? []) {
    const list = daysByWeek.get(day.week_id) ?? [];
    list.push(day);
    daysByWeek.set(day.week_id, list);
  }

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
                <span className="text-[14px] text-ink/70">Atividade (PDF)</span>
                <PdfUploadField
                  name="activityPath"
                  path={`atividades/${week.id}.pdf`}
                  hasExisting={!!week.activity_pdf_path}
                />
              </label>
              <label className="flex flex-col gap-2 md:col-span-3">
                <span className="text-[14px] text-ink/70">Guia dos Pais (Markdown)</span>
                <GuideMarkdownHint />
                <textarea
                  name="description"
                  defaultValue={week.description ?? ""}
                  rows={12}
                  placeholder={GUIDE_PLACEHOLDER}
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                />
              </label>
              <Button type="submit" variant="secondary" className="md:col-span-3 md:justify-self-start">
                Salvar
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-line">
              <h4 className="font-heading font-semibold text-[16px] text-ink mb-1">
                Dias da semana
              </h4>
              <p className="text-ink/50 text-[13px] mb-4">
                Um card por dia (Segunda, Terça...), cada um com seu próprio
                texto (mesmo formato do Guia dos Pais) e um PDF pra baixar.
              </p>

              <div className="flex flex-col gap-4">
                {(daysByWeek.get(week.id) ?? []).map((day) => (
                  <div key={day.id} className="border border-line rounded-sm p-4 bg-parchment/40">
                    <form action={updateWeekDayAction} className="grid md:grid-cols-3 gap-3 items-end">
                      <input type="hidden" name="dayId" value={day.id} />
                      <input type="hidden" name="trackSlug" value={trackSlug} />
                      <label className="flex flex-col gap-2">
                        <span className="text-[13px] text-ink/70">Nome do dia</span>
                        <input
                          type="text"
                          name="label"
                          defaultValue={day.label}
                          required
                          className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[13px] text-ink/70">
                          PDF do dia {day.pdf_path ? "(substituir)" : ""}
                        </span>
                        <PdfUploadField
                          name="pdfPath"
                          path={`dias/${day.id}.pdf`}
                          hasExisting={!!day.pdf_path}
                        />
                      </label>
                      <div className="flex items-center gap-3">
                        <Button type="submit" variant="secondary" className="!px-4 !py-1.5 !text-[13px]">
                          Salvar dia
                        </Button>
                        <Badge tone={day.pdf_path ? "moss" : "muted"}>
                          {day.pdf_path ? "PDF enviado" : "Sem PDF"}
                        </Badge>
                      </div>
                      <label className="flex flex-col gap-2 md:col-span-3">
                        <span className="text-[13px] text-ink/70">
                          Conteúdo do dia (Markdown, mesmo formato do Guia dos Pais)
                        </span>
                        <textarea
                          name="content"
                          defaultValue={day.content ?? ""}
                          rows={6}
                          className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                        />
                      </label>
                    </form>
                    <form action={deleteWeekDayAction} className="mt-3">
                      <input type="hidden" name="dayId" value={day.id} />
                      <input type="hidden" name="trackSlug" value={trackSlug} />
                      <button
                        type="submit"
                        className="text-[12px] text-terracotta underline underline-offset-2"
                      >
                        Remover este dia
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <form
                action={createWeekDayAction}
                className="grid md:grid-cols-3 gap-3 items-end mt-4 border border-dashed border-line rounded-sm p-4"
              >
                <input type="hidden" name="weekId" value={week.id} />
                <input type="hidden" name="trackSlug" value={trackSlug} />
                <input
                  type="hidden"
                  name="dayNumber"
                  value={(daysByWeek.get(week.id)?.length ?? 0) + 1}
                />
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] text-ink/70">Nome do novo dia</span>
                  <input
                    type="text"
                    name="label"
                    placeholder="Ex: Segunda-feira"
                    required
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[13px] text-ink/70">PDF do dia (opcional)</span>
                  <PdfUploadField name="pdfPath" path={`dias/${randomUUID()}.pdf`} />
                </label>
                <Button type="submit" variant="ghost" className="!px-4 !py-1.5 !text-[13px]">
                  + Adicionar dia
                </Button>
                <label className="flex flex-col gap-2 md:col-span-3">
                  <span className="text-[13px] text-ink/70">Conteúdo do dia (Markdown, opcional)</span>
                  <textarea
                    name="content"
                    rows={6}
                    placeholder="Texto do dia — mesmo formato do Guia dos Pais"
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                  />
                </label>
              </form>
            </div>
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
            <span className="text-[14px] text-ink/70">Atividades (PDF, opcional)</span>
            <PdfUploadField name="activityPath" path={`atividades/${randomUUID()}.pdf`} />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[14px] text-ink/70">Guia dos Pais (Markdown, opcional)</span>
            <GuideMarkdownHint />
            <textarea
              name="description"
              rows={12}
              placeholder={GUIDE_PLACEHOLDER}
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
