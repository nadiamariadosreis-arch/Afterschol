import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <>
      <header className="px-6 md:px-[8vw] pt-16 pb-10 border-b border-line">
        <div className="font-body text-[13px] tracking-[0.24em] uppercase text-teal-dark font-bold mb-4">
          Jogos pedagógicos para a sua família
        </div>
        <h1 className="font-display font-bold text-[40px] md:text-[56px] text-ink max-w-3xl">
          Cérebro em Jogo
        </h1>
        <p className="text-[19px] text-ink/70 max-w-xl mt-4">
          Jogos que trabalham alfabetização e virtudes brincando — busque
          pelo desafio que sua família está enfrentando hoje e encontre o
          jogo certo, com videoaula, PDF para baixar e a explicação de como
          ele ajuda seu filho.
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
                2. Veja o jogo certo
              </h3>
              <p className="text-ink/70">
                Cada jogo tem uma videoaula mostrando como jogar e um texto
                explicando por que ele ajuda a criança a vencer aquele
                desafio específico — base em neuroplasticidade.
              </p>
            </Card>
            <Card>
              <h3 className="font-display font-bold text-[18px] text-ink mb-2">
                3. Baixe e jogue
              </h3>
              <p className="text-ink/70">
                O material do jogo fica disponível em PDF para baixar e
                imprimir, ou usar direto na tela com a família.
              </p>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
