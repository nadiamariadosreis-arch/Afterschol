import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PdfUploadField } from "@/components/admin/PdfUploadField";
import { createVirtueAction, replaceBookletAction } from "./actions";

export default async function VirtuesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: saveError } = await searchParams;
  const supabase = await createClient();
  const { data: virtues } = await supabase.from("virtues").select("*").order("number");

  return (
    <div>
      <SectionHeading eyebrow="Conteúdo" title="Virtudes / Livrinhos" />

      {saveError ? (
        <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
          <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
          <p className="text-ink/70 text-[13px] mt-1">{saveError}</p>
        </div>
      ) : null}

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
              <form action={replaceBookletAction} className="flex items-center gap-3">
                <input type="hidden" name="virtueId" value={virtue.id} />
                <PdfUploadField
                  name="bookletPath"
                  path={`virtudes/${virtue.id}.pdf`}
                  hasExisting={!!virtue.booklet_pdf_path}
                />
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
            <PdfUploadField name="bookletPath" path={`virtudes/${randomUUID()}.pdf`} />
          </label>
          <Button type="submit" variant="primary">
            Cadastrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
