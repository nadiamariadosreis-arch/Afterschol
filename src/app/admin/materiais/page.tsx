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
import type { Category, Material } from "@/lib/supabase/types";
import { createMaterialAction, deleteMaterialAction, updateMaterialAction } from "./actions";

type MaterialWithCategory = Material & { categories: Pick<Category, "name"> | null };

export default async function MaterialsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: saveError } = await searchParams;
  const supabase = await createClient();

  const [{ data: materials }, { data: categories }] = await Promise.all([
    supabase
      .from("materials")
      .select("*, categories(name)")
      .order("sort_order")
      .returns<MaterialWithCategory[]>(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Portal de Catequese" title="Materiais" />

      {saveError ? (
        <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
          <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
          <p className="text-ink/70 text-[13px] mt-1">{saveError}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 mb-10">
        {(materials ?? []).map((material) => (
          <Card key={material.id} className="flex flex-col md:flex-row gap-6">
            <Cover
              trackSlug={material.id}
              mark={material.title.charAt(0)}
              imageUrl={coverImageUrl(material.cover_image_path)}
              className="w-full md:w-40 h-40 shrink-0 rounded-sm"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <h3 className="font-heading font-semibold text-[20px] text-ink">
                  {material.title}
                </h3>
                <Badge tone={material.pdf_path ? "moss" : "terracotta"}>
                  {material.pdf_path ? "PDF enviado" : "Sem PDF"}
                </Badge>
              </div>

              <form action={updateMaterialAction} className="grid md:grid-cols-3 gap-3 items-end">
                <input type="hidden" name="materialId" value={material.id} />
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Título</span>
                  <input
                    type="text"
                    name="title"
                    defaultValue={material.title}
                    required
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Categoria</span>
                  <select
                    name="categoryId"
                    defaultValue={material.category_id ?? ""}
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
                    defaultValue={material.age_range ?? ""}
                    placeholder="Ex: 3 a 5 anos"
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>

                <label className="flex flex-col gap-2 md:col-span-3">
                  <span className="text-[14px] text-ink/70">Descrição curta</span>
                  <input
                    type="text"
                    name="description"
                    defaultValue={material.description ?? ""}
                    placeholder="Uma frase sobre o material, aparece no card do catálogo."
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Vídeo — como usar (URL, opcional)</span>
                  <input
                    type="url"
                    name="videoUrl"
                    defaultValue={material.video_url ?? ""}
                    placeholder="https://..."
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Capa (imagem)</span>
                  <input type="file" name="cover" accept="image/png,image/jpeg,image/webp" className="text-[13px]" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[14px] text-ink/70">Material (PDF)</span>
                  <PdfUploadField
                    name="pdfPath"
                    path={`materiais/${material.id}.pdf`}
                    hasExisting={!!material.pdf_path}
                  />
                </label>

                <label className="flex flex-col gap-2 md:col-span-3">
                  <span className="text-[14px] text-ink/70">Instruções (Markdown, opcional)</span>
                  <MarkdownHint />
                  <textarea
                    name="instructions"
                    defaultValue={material.instructions ?? ""}
                    rows={10}
                    placeholder={GUIDE_MARKDOWN_PLACEHOLDER}
                    className="border border-line bg-parchment rounded-sm px-3 py-2 font-mono text-[13px] text-ink outline-none focus:border-moss resize-y"
                  />
                </label>

                <Button type="submit" variant="secondary" className="md:col-span-3 md:justify-self-start">
                  Salvar
                </Button>
              </form>

              <form action={deleteMaterialAction} className="mt-3">
                <input type="hidden" name="materialId" value={material.id} />
                <button type="submit" className="text-[12px] text-terracotta underline underline-offset-2">
                  Remover este material
                </button>
              </form>
            </div>
          </Card>
        ))}

        {(materials ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhum material cadastrado ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Adicionar novo material
        </h3>
        <form action={createMaterialAction} className="grid md:grid-cols-3 gap-3 items-end">
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
              placeholder="Uma frase sobre o material, aparece no card do catálogo."
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Vídeo — como usar (URL, opcional)</span>
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
            <span className="text-[14px] text-ink/70">Material (PDF, opcional)</span>
            <PdfUploadField name="pdfPath" path={`materiais/${randomUUID()}.pdf`} />
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
            Adicionar material
          </Button>
        </form>
      </Card>
    </div>
  );
}
