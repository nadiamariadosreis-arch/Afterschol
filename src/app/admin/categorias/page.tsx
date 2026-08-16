import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "./actions";

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: saveError } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("game_categories")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <SectionHeading eyebrow="Jogos" title="Categorias" />

      {saveError ? (
        <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
          <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
          <p className="text-ink/70 text-[13px] mt-1">{saveError}</p>
        </div>
      ) : null}

      <p className="text-ink/60 text-[14px] mb-6">
        As categorias organizam as prateleiras/filtros do catálogo de jogos
        (ex: Atenção, Memória). A ordem aqui define a ordem de exibição.
      </p>

      <div className="flex flex-col gap-3 mb-10">
        {(categories ?? []).map((category) => (
          <Card key={category.id} className="flex items-center gap-3 flex-wrap !p-4">
            <form action={updateCategoryAction} className="flex items-center gap-3 flex-1 flex-wrap">
              <input type="hidden" name="categoryId" value={category.id} />
              <input
                type="text"
                name="name"
                defaultValue={category.name}
                required
                className="flex-1 min-w-[160px] border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
              />
              <input
                type="number"
                name="sortOrder"
                defaultValue={category.sort_order}
                className="w-20 border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
              />
              <Button type="submit" variant="secondary" className="!px-4 !py-1.5 !text-[13px]">
                Salvar
              </Button>
            </form>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="categoryId" value={category.id} />
              <button type="submit" className="text-[12px] text-terracotta underline underline-offset-2">
                Remover
              </button>
            </form>
          </Card>
        ))}

        {(categories ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhuma categoria cadastrada ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Nova categoria
        </h3>
        <form action={createCategoryAction} className="flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Atenção"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Ordem</span>
            <input
              type="number"
              name="sortOrder"
              defaultValue={0}
              className="w-20 border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <Button type="submit" variant="primary">
            Adicionar
          </Button>
        </form>
      </Card>
    </div>
  );
}
