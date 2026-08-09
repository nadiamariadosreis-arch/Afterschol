import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createVirtueAction, replaceBookletAction } from "./actions";

export default async function VirtuesAdminPage() {
  const supabase = await createClient();
  const { data: virtues } = await supabase.from("virtues").select("*").order("number");

  return (
    <div>
      <SectionHeading eyebrow="Conteúdo" title="Virtudes / Livrinhos" />

      <div className="flex flex-col gap-4 mb-10">
        {(virtues ?? []).map((virtue) => (
          <Card key={virtue.id} className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-1">
                Virtude {virtue.number}
              </div>
              <h3 className="font-heading font-semibold text-[20px] text-ink">{virtue.name}</h3>
            </div>

            <div className="flex items-center gap-4">
              <Badge tone={virtue.booklet_pdf_path ? "moss" : "terracotta"}>
                {virtue.booklet_pdf_path ? "PDF enviado" : "Sem PDF"}
              </Badge>
              <form action={replaceBookletAction} className="flex items-center gap-2">
                <input type="hidden" name="virtueId" value={virtue.id} />
                <input type="file" name="booklet" accept="application/pdf" required className="text-[14px]" />
                <Button type="submit" variant="secondary">
                  {virtue.booklet_pdf_path ? "Substituir" : "Enviar"}
                </Button>
              </form>
            </div>
          </Card>
        ))}

        {(virtues ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhuma virtude cadastrada ainda.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">
          Cadastrar nova virtude
        </h3>
        <form action={createVirtueAction} className="grid md:grid-cols-[100px_1fr_1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Número</span>
            <input
              type="number"
              name="number"
              min={1}
              max={20}
              required
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Nome da virtude</span>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Paciência"
              className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[14px] text-ink/70">Livrinho (PDF)</span>
            <input type="file" name="booklet" accept="application/pdf" className="text-[14px]" />
          </label>
          <Button type="submit" variant="primary">
            Cadastrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
