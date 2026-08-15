import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sunburst } from "@/components/ui/Sunburst";

const PROCESSOS = [
  { titulo: "Essencial", pct: "60%", resumo: "Manter a vida funcionando." },
  { titulo: "Compromissos", pct: "10%", resumo: "Resolver o que já foi assumido." },
  { titulo: "Futuro", pct: "15%", resumo: "Construir o amanhã." },
  { titulo: "Presente", pct: "15%", resumo: "Viver bem o hoje." },
];

const PILARES = [
  {
    n: "01",
    titulo: "Avaliar",
    resumo: "Sentar uma vez, olhar o cenário real, sem julgamento.",
    gratis: true,
  },
  {
    n: "02",
    titulo: "Planejar",
    resumo: "Decidir o plano do mês, com um plano de ação real para o que dói.",
    gratis: false,
  },
  {
    n: "03",
    titulo: "Fazer Acontecer",
    resumo: "O dia em que o dinheiro cai é o dia de agir — não depois.",
    gratis: false,
  },
  {
    n: "04",
    titulo: "Acompanhar",
    resumo: "Revisão contínua, com perguntas — não cobrança.",
    gratis: false,
  },
];

const DORES = [
  "Chegar no fim do mês sem saber pra onde o dinheiro foi.",
  "Discutir com o cônjuge sobre dinheiro — sempre a mesma discussão.",
  "Viver apagando incêndio: uma conta atrasada resolvida, outra já vencendo.",
  "Sentir que devia estar guardando pro futuro dos filhos, mas nunca sobra nada.",
  "Abrir o aplicativo do banco com um aperto no peito, e fechar de novo sem olhar direito.",
];

const RECEBE = [
  "Acesso completo à plataforma por 1 ano — Planejar, Fazer Acontecer e Acompanhar.",
  "O Avaliar liberado hoje mesmo, de graça, pra você sentir como funciona antes de decidir.",
  "Os 4 pilares guiados, mês a mês, como um curso — nunca como uma planilha em branco.",
  "Tudo salvo automaticamente enquanto você preenche — nada se perde.",
  "Um resumo do mês com gráfico: quanto entra, quanto sai, quanto sobra.",
  "Histórico de todos os ciclos anteriores, com o planner de cada mês pra revisar quando quiser.",
  "Funciona no celular e no computador — dá até pra instalar como app, direto da tela inicial.",
];

const FAQ = [
  {
    p: "Preciso entender de finanças pra usar?",
    r: "Não. O método foi feito pra quem nunca organizou nada — cada pilar te guia passo a passo, com sugestões prontas pra você só ajustar.",
  },
  {
    p: "É uma assinatura que cobra todo mês?",
    r: "Não. É uma compra única. O valor te dá 1 ano de acesso completo — sem cobrança recorrente, sem susto no cartão.",
  },
  {
    p: "O que acontece depois de 1 ano?",
    r: "Seu histórico continua salvo. Pra seguir usando Planejar, Fazer Acontecer e Acompanhar, é só renovar — o Avaliar continua liberado de graça, sempre.",
  },
  {
    p: "Funciona mesmo se eu não tenho reserva nenhuma hoje?",
    r: "Sim — é justamente pra esse ponto de partida que o método existe. O primeiro pilar é sentar e olhar o cenário real, exatamente como ele está agora.",
  },
  {
    p: "Preciso instalar algum aplicativo?",
    r: "Não precisa de loja de aplicativo — é acessar pelo navegador do celular ou computador. Se quiser, dá pra adicionar um ícone na tela inicial, e abre como um app.",
  },
  {
    p: "E se eu comprar e não for pra minha família?",
    r: "Você tem 7 dias de garantia — é seu direito garantido por lei em qualquer compra online no Brasil (Art. 49 do Código de Defesa do Consumidor). Se não for pra vocês, é só pedir o reembolso, sem burocracia.",
  },
];

export default function LandingPage() {
  const checkoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#";

  return (
    <>
      <header className="px-6 md:px-[8vw] pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-orange text-white flex items-center justify-center shrink-0">
            <Sunburst size={16} />
          </span>
          <span className="font-display-italic font-semibold text-[18px] text-ink">Método A.P.F.A</span>
        </div>
        <a href="/login" className="text-[14px] font-semibold text-ink/60 hover:text-orange-dark transition-colors">
          Já sou membro — entrar
        </a>
      </header>

      <section className="cover-gradient relative overflow-hidden px-6 md:px-[8vw] pt-10 pb-16 md:pt-14 md:pb-20">
        <Sunburst size={320} className="absolute -right-16 -top-24 text-white/10 hidden md:block" />
        <div className="relative max-w-3xl">
          <div className="text-white/70 text-[13px] tracking-[0.24em] uppercase font-bold mb-5">
            Finanças para famílias católicas
          </div>
          <h1 className="font-display-italic font-semibold text-[36px] md:text-[52px] text-white leading-[1.15]">
            O método que tira o dinheiro da cabeça da sua família — e coloca ele na mesa, com fé.
          </h1>
          <p className="text-[18px] md:text-[19px] text-white/85 max-w-2xl mt-6 leading-relaxed">
            A maioria das famílias não trava por falta de planilha — trava na hora de decidir. O
            Método A.P.F.A. é um ritual mensal de 4 passos que organiza o que entra e o que sai, sem
            culpa e sem terrorismo financeiro. Ordem não é o oposto da fé — é o que abre espaço pra
            ela: quem sabe onde está, consegue confiar de verdade na Providência, em vez de viver com
            medo.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body font-bold text-[17px] bg-white text-orange-dark hover:bg-cream shadow-lg transition-colors"
            >
              Quero o Método completo — R$ 97 →
            </a>
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-[15px] bg-transparent text-white border border-white/40 hover:border-white transition-colors"
            >
              Testar grátis o Avaliar
            </Link>
          </div>
          <p className="text-white/60 text-[13px] mt-5">
            Acesso por 1 ano · Compra única, sem mensalidade · 7 dias de garantia
          </p>
        </div>
      </section>

      <main className="flex-1 px-6 md:px-[8vw] py-16 max-w-6xl mx-auto w-full">
        <section className="mb-20 max-w-3xl">
          <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-3">
            Você reconhece isso?
          </div>
          <h2 className="font-display-italic font-semibold text-[30px] text-ink mb-8">
            Não é falta de disciplina. É falta de um ritual.
          </h2>
          <div className="flex flex-col gap-3.5">
            {DORES.map((dor) => (
              <div key={dor} className="flex items-start gap-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2.5 shrink-0" />
                <p className="text-ink/75 text-[16px]">{dor}</p>
              </div>
            ))}
          </div>
          <p className="text-ink/70 text-[16px] mt-8 leading-relaxed">
            Nenhuma família fecha as contas por força de vontade sozinha — fecha porque tem um
            momento fixo, todo mês, pra sentar e decidir junto. É isso que o Método A.P.F.A. entrega:
            não mais uma planilha em branco esperando disciplina, mas um caminho guiado que a família
            simplesmente segue.
          </p>
        </section>

        <section className="mb-20">
          <SectionHeading
            eyebrow="Os 4 processos"
            title="Um lugar para cada parte do dinheiro"
            subtitle="Categorias simples, de uso diário — sem jargão financeiro. A plataforma sugere o cenário ideal a partir da sua renda, e sua família ajusta."
          />
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {PROCESSOS.map((p) => (
              <div key={p.titulo} className="rounded-2xl bg-card border border-line p-6 flex flex-col gap-1">
                <span className="font-display-italic font-semibold text-[30px] text-orange-dark leading-none mb-2">
                  {p.pct}
                </span>
                <h3 className="font-semibold text-[17px] text-ink">{p.titulo}</h3>
                <p className="text-ink/60 text-[14px]">{p.resumo}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <SectionHeading
            eyebrow="Os 4 pilares"
            title="O ritmo mensal que fecha o ciclo sozinho"
            subtitle="Avaliar, Planejar, Fazer Acontecer e Acompanhar — quatro módulos guiados, como um curso, nunca como um formulário financeiro frio."
          />
          <div className="grid md:grid-cols-2 gap-5">
            {PILARES.map((p) => (
              <div
                key={p.n}
                className="rounded-2xl bg-card border border-line border-l-[3px] border-l-orange p-6 flex gap-4"
              >
                <span className="font-display-italic font-semibold text-[36px] text-orange-light leading-none shrink-0">
                  {p.n}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[19px] text-ink">{p.titulo}</h3>
                    {p.gratis ? (
                      <span className="text-[11px] font-bold uppercase tracking-wide text-mint bg-mint-bg rounded-full px-2 py-0.5">
                        Grátis
                      </span>
                    ) : null}
                  </div>
                  <p className="text-ink/65 text-[15px]">{p.resumo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 max-w-3xl">
          <div className="font-body text-[13px] tracking-[0.24em] uppercase text-orange-dark font-bold mb-3">
            O que você recebe
          </div>
          <h2 className="font-display-italic font-semibold text-[30px] text-ink mb-8">
            Tudo pronto pra sentar com a família hoje
          </h2>
          <div className="flex flex-col gap-3.5">
            {RECEBE.map((item) => (
              <div key={item} className="flex items-start gap-3.5">
                <span className="text-mint font-bold text-[16px] leading-none mt-0.5 shrink-0">✓</span>
                <p className="text-ink/75 text-[16px]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="preco" className="mb-20">
          <div className="cover-gradient relative overflow-hidden rounded-2xl px-7 py-10 md:px-14 md:py-14 text-center">
            <Sunburst size={200} className="absolute -left-10 -bottom-14 text-white/10 hidden md:block" />
            <p className="text-white/70 text-[13px] tracking-[0.24em] uppercase font-bold mb-3">
              Acesso completo por 1 ano
            </p>
            <p className="font-display-italic font-semibold text-white text-[52px] md:text-[64px] leading-none">
              R$ 97
            </p>
            <p className="text-white/80 text-[16px] mt-3 max-w-xl mx-auto">
              Compra única — sem mensalidade, sem cobrança recorrente. O Avaliar continua grátis pra
              sempre, mesmo depois do ano acabar.
            </p>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body font-bold text-[17px] bg-white text-orange-dark hover:bg-cream shadow-lg transition-colors mt-8"
            >
              Quero começar agora →
            </a>
          </div>
        </section>

        <section className="mb-20 max-w-3xl">
          <Sunburst size={32} className="text-orange mb-4" />
          <h2 className="font-display-italic font-semibold text-[26px] text-ink mb-3">
            Garantia de 7 dias
          </h2>
          <p className="text-ink/70 text-[16px] leading-relaxed">
            Todo mundo que compra online no Brasil tem 7 dias pra se arrepender — é lei (Art. 49 do
            Código de Defesa do Consumidor), não é promessa nossa. Então entra, use o Avaliar, veja o
            diagnóstico da sua família de verdade. Se em 7 dias você sentir que não é pra vocês, é só
            pedir o reembolso.
          </p>
        </section>

        <section className="mb-20 max-w-3xl">
          <SectionHeading eyebrow="Perguntas frequentes" title="Antes de você decidir" />
          <div className="flex flex-col gap-5">
            {FAQ.map((f) => (
              <div key={f.p} className="border-b border-line pb-5">
                <h3 className="font-semibold text-[17px] text-ink mb-1.5">{f.p}</h3>
                <p className="text-ink/65 text-[15px] leading-relaxed">{f.r}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center max-w-2xl mx-auto">
          <h2 className="font-display-italic font-semibold text-[28px] md:text-[32px] text-ink mb-3">
            O primeiro passo é grátis e leva menos de 15 minutos.
          </h2>
          <p className="text-ink/70 text-[16px] mb-8">
            Comece agora pelo Avaliar, sem compromisso — ou já garanta o método completo pra sua
            família colocar em prática este mês.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 font-body font-bold text-[17px] bg-orange text-white hover:bg-orange-dark shadow-lg transition-colors"
            >
              Quero o Método completo — R$ 97 →
            </a>
            <LinkButton href="/cadastro" variant="secondary">
              Testar grátis o Avaliar
            </LinkButton>
          </div>
        </section>
      </main>
    </>
  );
}
