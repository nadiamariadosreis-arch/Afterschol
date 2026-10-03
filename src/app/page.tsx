import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <>
      <header className="px-6 md:px-[8vw] pt-16 pb-10 border-b border-line">
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-teal-dark font-bold mb-4">
          Banco de atividades para fugir das telas
        </div>
        <h1 className="font-display font-bold text-[40px] md:text-[56px] text-ink max-w-3xl">
          Arsenal Zero Telas
        </h1>
        <p className="text-[19px] text-ink/70 max-w-xl mt-4">
          Jogos e atividades que trabalham alfabetização e virtudes brincando
          — busque pelo desafio que sua família está enfrentando hoje e
          encontre a atividade certa, com videoaula, PDF para imprimir e a
          explicação de como ela ajuda seu filho a ficar longe da tela.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton href="/login" variant="primary">
            Já sou membro — entrar
          </LinkButton>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-[8vw] py-16 max-w-6xl mx-auto w-full">
        <section>
          <SectionHeading
            eyebrow="Como funciona"
            title="Busque pelo desafio, não pela idade"
          />
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <h3 className="font-display font-bold text-[18px] text-ink mb-2">
                1. Conte a queixa
              </h3>
              <p className="text-ink/70">
                Filtre por aquilo que você está vivendo — &ldquo;chora muito
                para fazer as coisas&rdquo;, &ldquo;não tem paciência&rdquo;,
                &ldquo;tem dificuldade para ler&rdquo; — ou pela virtude que
                quer desenvolver.
              </p>
            </Card>
            <Card>
              <h3 className="font-display font-bold text-[18px] text-ink mb-2">
                2. Veja a atividade certa
              </h3>
              <p className="text-ink/70">
                Cada atividade tem uma videoaula mostrando como usar e um
                texto explicando por que ela ajuda a criança a vencer aquele
                desafio específico — base em neuroplasticidade.
              </p>
            </Card>
            <Card>
              <h3 className="font-display font-bold text-[18px] text-ink mb-2">
                3. Imprima e brinque
              </h3>
              <p className="text-ink/70">
                O material fica disponível em PDF para baixar e imprimir —
                pensado para a criança brincar longe da tela, não na tela.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
