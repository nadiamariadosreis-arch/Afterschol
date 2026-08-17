import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/member/Logo";
import { SkillIcon, paletteFor } from "@/components/member/skillVisuals";
import type { GameCategory, Product } from "@/lib/supabase/types";

export default async function LandingPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("game_categories").select("*").order("sort_order"),
    supabase.from("products").select("*").eq("code", "pacote_completo").maybeSingle(),
  ]);

  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <header className="px-6 md:px-[8vw] py-6 flex items-center justify-between gap-3">
        <Logo compact />
        <LinkButton
          href="/login"
          variant="secondary"
          className="!border-navy !text-navy !px-4 !py-2 shrink-0 whitespace-nowrap"
        >
          <span className="md:hidden">Entrar</span>
          <span className="hidden md:inline">Já sou membro — entrar</span>
        </LinkButton>
      </header>

      <main className="flex-1">
        <section className="px-6 md:px-[8vw] py-10 md:py-16">
          <div className="relative overflow-hidden rounded-2xl bg-card border border-line grid md:grid-cols-[1.2fr_1fr] items-center max-w-6xl mx-auto">
            <div className="p-8 md:p-14">
              <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
                Plataforma cristã de jogos pedagógicos
              </div>
              <h1 className="font-heading font-bold text-[34px] md:text-[46px] text-navy leading-[1.15]">
                Jogos que desenvolvem habilidades para a vida toda.
              </h1>
              <p className="text-ink/60 mt-4 text-[17px] max-w-md">
                Diversão com propósito, formação que fica. Uma coleção de
                jogos educativos pensados para desenvolver atenção, memória,
                autocontrole e linguagem — com a fé no centro.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#habilidades"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 font-body font-semibold text-[15px] bg-navy text-white hover:bg-ink transition-colors"
                >
                  Explorar jogos
                </a>
              </div>
            </div>
            <div className="relative hidden md:block h-full min-h-[320px]">
              <HeroIllustration />
            </div>
          </div>
        </section>

        <section id="habilidades" className="px-6 md:px-[8vw] py-10 md:py-16 max-w-6xl mx-auto">
          <div className="font-body text-[13px] tracking-[0.28em] uppercase text-flame mb-3">
            Como funciona
          </div>
          <h2 className="font-heading font-bold text-[28px] md:text-[32px] text-navy mb-10">
            Um jogo para cada habilidade que seu filho está desenvolvendo
          </h2>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((c: GameCategory, i: number) => {
                const palette = paletteFor(i);
                return (
                  <div
                    key={c.id}
                    className="flex flex-col items-center gap-2.5 rounded-2xl p-5 text-center shadow-sm"
                    style={{ backgroundColor: palette.bg }}
                  >
                    <span style={{ color: palette.fg }}>
                      <SkillIcon name={c.name} />
                    </span>
                    <span className="font-heading font-semibold text-[14px] text-ink leading-snug">
                      {c.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <p className="text-ink/60 max-w-2xl mt-10">
            Cada jogo vem com o material para baixar e imprimir, um vídeo
            mostrando como jogar e instruções passo a passo — para você
            escolher com confiança o jogo certo para o momento do seu filho.
          </p>
        </section>

        {product ? (
          <section className="px-6 md:px-[8vw] pb-16 max-w-6xl mx-auto">
            <div className="rounded-2xl bg-navy text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-heading font-bold text-[24px]">
                  {product.name}
                </h3>
                <p className="text-white/70 mt-1 max-w-md">
                  {product.description ?? "Acesso a todo o catálogo de jogos."}
                </p>
              </div>
              <BuyButton product={product} />
            </div>
          </section>
        ) : null}
      </main>

      <footer className="px-6 md:px-[8vw] py-8 border-t border-line text-center text-[14px] text-ink/50">
        <Link href="/login" className="underline underline-offset-4">
          Entrar na área de membros
        </Link>
      </footer>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="absolute inset-0">
      <div className="absolute w-16 h-16 rounded-full" style={{ background: "#e4ecf7", top: "12%", left: "12%" }} />
      <div className="absolute w-10 h-10 rounded-full" style={{ background: "#faf0d6", top: "68%", left: "18%" }} />
      <div className="absolute w-12 h-12 rounded-full" style={{ background: "#f2e0e6", top: "20%", left: "78%" }} />
      <div className="absolute w-8 h-8 rounded-full" style={{ background: "#e7f1e2", top: "72%", left: "80%" }} />
      <div
        className="absolute rounded-2xl shadow-lg flex items-center justify-center"
        style={{
          width: "180px",
          height: "180px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-4deg)",
          background: "linear-gradient(135deg, #f7e3da, #f2e0e6)",
        }}
      >
        <svg viewBox="0 0 48 48" className="w-16 h-16" style={{ color: "#a15230" }}>
          <path d="M6 12c6-3 12-2 18 1v25c-6-3-12-4-18-1V12Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M42 12c-6-3-12-2-18 1v25c6-3 12-4 18-1V12Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M24 13v25" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}

function BuyButton({ product }: { product: Product }) {
  if (product.available_for_sale && product.checkout_url) {
    return (
      <LinkButton
        href={product.checkout_url}
        variant="primary"
        className="!bg-white !text-navy !border-white hover:!bg-cream shrink-0"
      >
        Adquirir acesso
      </LinkButton>
    );
  }

  return (
    <span className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body text-[15px] border border-white/30 text-white/60 shrink-0">
      Em breve
    </span>
  );
}
