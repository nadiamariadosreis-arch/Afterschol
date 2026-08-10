import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createJogoAction } from "./actions";

export default async function JogosAdminPage() {
  const supabase = await createClient();
  const { data: jogos } = await supabase.from("jogos").select("*").order("titulo");

  return (
    <div>
      <SectionHeading eyebrow="Conteúdo" title="Jogos" />

      <div className="flex flex-col gap-4 mb-10">
        {(jogos ?? []).map((jogo) => (
          <Link key={jogo.id} href={`/admin/jogos/${jogo.id}`}>
            <Card className="flex items-center justify-between gap-4 flex-wrap hover:border-coral transition-colors">
              <h3 className="font-display font-bold text-[18px] text-ink">{jogo.titulo}</h3>
              <Badge tone={jogo.published ? "teal" : "muted"}>
                {jogo.published ? "Publicado" : "Rascunho"}
              </Badge>
            </Card>
          </Link>
        ))}

        {(jogos ?? []).length === 0 ? <p className="text-ink/60">Nenhum jogo cadastrado ainda.</p> : null}
      </div>

      <Card>
        <h3 className="font-display font-bold text-[20px] text-ink mb-4">Cadastrar novo jogo</h3>
        <form action={createJogoAction} className="flex gap-3 items-end flex-wrap">
          <label className="flex flex-col gap-2 flex-1 min-w-[220px]">
            <span className="text-[14px] text-ink/70">Título do jogo</span>
            <input
              type="text"
              name="titulo"
              required
              className="border border-line bg-cream rounded-xl px-3 py-2 font-body text-ink outline-none focus:border-coral"
            />
          </label>
          <Button type="submit" variant="primary">
            Criar e editar
          </Button>
        </form>
      </Card>
    </div>
  );
}
