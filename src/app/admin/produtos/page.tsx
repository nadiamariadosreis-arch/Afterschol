import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { updateProductAction } from "./actions";

export default async function ProductsAdminPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order("code");

  return (
    <div>
      <SectionHeading eyebrow="Vendas" title="Produtos e Acessos" />
      <p className="text-ink/60 max-w-2xl mb-8">
        Controle o que já pode ser vendido. Trilhas marcadas como indisponíveis
        aparecem na plataforma como &ldquo;Em breve&rdquo;, sem link de compra.
      </p>

      <div className="flex flex-col gap-4">
        {(products ?? []).map((product) => (
          <Card key={product.id}>
            <form action={updateProductAction} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={product.id} />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-heading font-semibold text-[20px] text-ink">
                  {product.name}
                </h3>
                <label className="flex items-center gap-2 text-[15px] text-ink/80">
                  <input
                    type="checkbox"
                    name="availableForSale"
                    defaultChecked={product.available_for_sale}
                  />
                  Disponível para venda
                </label>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] text-ink/70">Link de checkout (Kiwify)</span>
                <input
                  type="url"
                  name="checkoutUrl"
                  defaultValue={product.checkout_url ?? ""}
                  placeholder="https://pay.kiwify.com.br/..."
                  className="border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss"
                />
              </label>
              <Button type="submit" variant="secondary" className="self-start">
                Salvar
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
