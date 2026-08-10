import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Tag } from "@/lib/supabase/types";
import { createTagAction, deleteTagAction } from "./actions";

export default async function TagsAdminPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("*").order("type").order("name");

  const queixas = (tags ?? []).filter((t) => t.type === "queixa");
  const virtudes = (tags ?? []).filter((t) => t.type === "virtude");

  return (
    <div>
      <SectionHeading
        eyebrow="Conteúdo"
        title="Tags — queixas das mães e virtudes buscadas"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <TagList title="Queixas" tone="coral" tags={queixas} />
        <TagList title="Virtudes" tone="teal" tags={virtudes} />
      </div>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Cadastrar nova tag</h3>
        <form action={createTagAction} className="grid md:grid-cols-[140px_1fr_1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Tipo</span>
            <select
              name="type"
              required
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            >
              <option value="queixa">Queixa</option>
              <option value="virtude">Virtude</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Chora muito para fazer tarefas"
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Descrição (opcional)</span>
            <input
              type="text"
              name="description"
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <Button type="submit" variant="primary">
            Cadastrar
          </Button>
        </form>
      </Card>
    </div>
  );
}

function TagList({ title, tone, tags }: { title: string; tone: "coral" | "teal"; tags: Tag[] }) {
  return (
    <Card>
      <h3 className="font-display font-bold text-[20px] text-ink mb-4">{title}</h3>
      {tags.length === 0 ? (
        <p className="text-ink/60">Nenhuma tag cadastrada ainda.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <form key={tag.id} action={deleteTagAction} className="inline-block">
              <input type="hidden" name="tagId" value={tag.id} />
              <button type="submit" title="Clique para remover" className="inline-block">
                <Badge tone={tone}>{tag.name} ✕</Badge>
              </button>
            </form>
          ))}
        </div>
      )}
    </Card>
  );
}
