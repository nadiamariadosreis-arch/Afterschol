import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Tag } from "@/lib/supabase/types";
import { tagLabel, tagTone } from "@/lib/tagStyle";
import { createTagAction, deleteTagAction } from "./actions";

const TYPE_OPTIONS = [
  { value: "queixa", label: "Queixa" },
  { value: "virtude", label: "Virtude" },
  { value: "idade", label: "Idade" },
  { value: "tempo", label: "Tempo disponível" },
  { value: "tipo", label: "Tipo de atividade" },
  { value: "modo", label: "Sozinha ou com adulto" },
];

export default async function TagsAdminPage() {
  const supabase = await createClient();
  const { data: tags } = await supabase.from("tags").select("*").order("type").order("name");

  const groups = new Map<string, Tag[]>();
  for (const tag of tags ?? []) {
    const list = groups.get(tag.type) ?? [];
    list.push(tag);
    groups.set(tag.type, list);
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Conteúdo"
        title="Tags — queixas, virtudes e atalhos rápidos"
      />

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {[...groups.entries()].map(([type, list]) => (
          <TagList key={type} title={tagLabel(type)} tone={tagTone(type)} tags={list} />
        ))}
        {groups.size === 0 ? <p className="text-ink/60">Nenhuma tag cadastrada ainda.</p> : null}
      </div>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Cadastrar nova tag</h3>
        <p className="text-ink/60 text-[14px] mb-4">
          Queixa/Virtude aparecem como filtros finos na busca. Idade, Tempo disponível, Tipo de
          atividade e Sozinha/Com adulto viram atalhos coloridos no topo da página de atividades.
        </p>
        <form action={createTagAction} className="grid md:grid-cols-[180px_1fr_1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Tipo</span>
            <select
              name="type"
              required
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: 5 a 6 anos, 15 minutos, Para brincar sozinha..."
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

function TagList({
  title,
  tone,
  tags,
}: {
  title: string;
  tone: BadgeTone;
  tags: Tag[];
}) {
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
