import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { OrnamentDivider } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import type { Product, Track } from "@/lib/supabase/types";

const LEVEL_LABEL: Record<Track["level"], string> = {
  inicial: "Nível inicial",
  intermediario: "Nível intermediário",
  avancado: "Nível avançado",
};

export default async function LandingPage() {
  const supabase = await createClient();

  const [{ data: tracks }, { data: products }] = await Promise.all([
    supabase.from("tracks").select("*").order("sort_order"),
    supabase.from("products").select("*"),
  ]);

  const productByCode = new Map<string, Product>((products ?? []).map((p) => [p.code, p]));
  const pacoteCompleto = productByCode.get("pacote_completo");

  return (
    <>
      <header className="px-6 md:px-[8vw] pt-16 pb-10 border-b border-line">
        <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-4">
          Afterschooling e formação de virtudes
        </div>
        <h1 className="font-display italic font-semibold text-[40px] md:text-[56px] text-ink max-w-3xl">
          Trilha das Virtudes
        </h1>
        <p className="text-[19px] text-ink/70 max-w-xl mt-4">
          Histórias que formam virtudes, fortalecem bons hábitos e despertam
          o prazer de aprender — uma coleção de 20 livrinhos infantis com
          atividades pedagógicas, entregues semana a semana para sua família.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="#trilhas" variant="primary">
            Ver as trilhas
          </LinkButton>
          <LinkButton href="/login" variant="secondary">
            Já sou membro — entrar
          </LinkButton>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-[8vw] py-16 max-w-6xl mx-auto w-full">
        <section id="trilhas">
          <div className="font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3">
            Como funciona
          </div>
          <h2 className="font-display italic font-semibold text-[34px] text-ink mb-4">
            Três trilhas, no ritmo da sua família
          </h2>
          <p className="text-ink/70 max-w-2xl mb-10">
            Cada trilha tem suas próprias semanas de conteúdo — o livrinho de
            virtude da semana, atividades pedagógicas e vídeo-aula, tudo em
            PDF, lido direto na plataforma. A cada onda, liberamos 2 novos
            livrinhos (4 semanas) nas 3 trilhas ao mesmo tempo.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {(tracks ?? []).map((track) => {
              const product = productByCode.get(track.product_code);
              return <TrackCard key={track.id} track={track} product={product} />;
            })}
          </div>

          {pacoteCompleto ? (
            <Card className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-heading font-semibold text-[24px] text-moss-dark">
                  Pacote Completo
                </h3>
                <p className="text-ink/70 mt-1">
                  Acesso às 3 trilhas — a família escolhe o nível certo para
                  cada filho.
                </p>
              </div>
              <BuyButton product={pacoteCompleto} />
            </Card>
          ) : null}
        </section>

        <OrnamentDivider />
      </main>

      <footer className="px-6 md:px-[8vw] py-8 border-t border-line text-center text-[14px] text-ink/50">
        <Link href="/login" className="underline underline-offset-4">
          Entrar na área de membros
        </Link>
      </footer>
    </>
  );
}

function TrackCard({ track, product }: { track: Track; product: Product | undefined }) {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <div className="text-[13px] tracking-[0.15em] uppercase text-moss mb-1">
          {LEVEL_LABEL[track.level]}
        </div>
        <h3 className="font-heading font-semibold text-[24px] text-ink">{track.name}</h3>
      </div>
      <p className="text-ink/70 text-[16px] flex-1">
        {track.slug === "letras" &&
          "Identificação de letras — o primeiro passo da alfabetização."}
        {track.slug === "silabas" &&
          "Sílabas para a criança começar a ler com confiança."}
        {track.slug === "gramatica" &&
          "Separação silábica, sílaba tônica e classes gramaticais."}
      </p>
      {product ? <BuyButton product={product} /> : null}
    </Card>
  );
}

function BuyButton({ product }: { product: Product }) {
  if (product.available_for_sale && product.checkout_url) {
    return (
      <LinkButton href={product.checkout_url} variant="primary" className="w-full">
        Adquirir
      </LinkButton>
    );
  }

  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-sm px-6 py-2.5 font-body text-[15px] tracking-wide border border-line text-ink/40 w-full">
      Em breve
    </span>
  );
}
