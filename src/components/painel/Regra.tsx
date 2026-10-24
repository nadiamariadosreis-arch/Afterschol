"use client";

import { Card, Eyebrow, Heading } from "./ui";

const PRINCIPIOS = [
  ["Escuta", "Prólogo", "O primeiro verbo da Regra", "Hoje · Lectio do dia"],
  ["Horas de oração e trabalho", "cap. 8–20, 43, 48", "O dia tem ritmo: tempo de orar, de trabalhar e de descansar", "Hoje · Horarium"],
  ["Discrição", "cap. 64, 19", "Medida em tudo: o que os fortes desejem e os fracos não fujam", "Semana · alerta de sobrecarga"],
  ["A despenseira", "cap. 31", "Cuidar dos bens como vasos sagrados do altar", "Casa"],
  ["Servir uns aos outros", "cap. 35", "Todos colaboram no serviço da casa", "Casa · mutirão"],
  ["Hospitalidade", "cap. 53", "Receber cada hóspede como Cristo", "Vésperas · retorno ao lar"],
  ["Cuidado com os doentes e frágeis", "cap. 36–37", "Antes de tudo e acima de tudo, o cuidado", "Hábitos · Eu mesma"],
  ["Silêncio", "cap. 6 e 42", "Silêncio que abre espaço para a escuta", "Vigílias e Completas"],
  ["Paciência mútua", "cap. 72", "Suportar as fraquezas uns dos outros", "Hábitos · Esposo"],
  ["Capítulo", "cap. 3", "Reunir-se para olhar a vida com verdade", "Capítulo"],
];

const VIDA = [
  ["c. 480", "Nasce em Núrsia, na Itália, de família nobre, junto com a irmã gêmea, Escolástica."],
  ["c. 500", "Estuda em Roma e, desiludido com a vida da cidade, retira-se para Subiaco, onde vive como eremita."],
  ["c. 529", "Funda o mosteiro de Monte Cassino, onde escreve a sua Regra."],
  ["c. 547", "Morre em Monte Cassino, depois de receber a Eucaristia. Sua Regra molda a vida cristã do Ocidente por quinze séculos."],
  ["1964", "O papa Paulo VI o proclama padroeiro da Europa."],
];

export function Regra() {
  return (
    <div className="space-y-6">
      <Heading sub="De onde vem este painel e por que ele funciona para uma mãe que trabalha fora.">
        São Bento e a Regra
      </Heading>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-navy text-white border-navy">
          <Eyebrow className="text-gold">A Regra em uma frase</Eyebrow>
          <p className="font-display text-[26px] leading-snug mt-2">Ora et labora: reza e trabalha, em ordem, com medida e com amor.</p>
          <p className="text-white/70 text-[14.5px] mt-3">
            A expressão <i>ora et labora</i> resume a Regra, mas não aparece literalmente nela. A Regra tem 73 capítulos curtos,
            escritos para gente comum, e chama a si mesma de “uma pequena regra para principiantes” (cap. 73).
          </p>
        </Card>

        <Card>
          <Eyebrow className="text-flame">A vida de São Bento</Eyebrow>
          <ol className="mt-3 space-y-3">
            {VIDA.map(([ano, txt]) => (
              <li key={ano} className="grid grid-cols-[64px_1fr] gap-3 text-[14.5px]">
                <span className="font-display text-gold text-[17px]">{ano}</span>
                <span className="text-ink/80">{txt}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="bg-cream border-gold/40">
        <Eyebrow className="text-gold">Escolástica e a tempestade</Eyebrow>
        <p className="mt-2 text-[15px] text-ink/80 max-w-3xl">
          Segundo São Gregório Magno, na última visita anual de Escolástica a Bento, ela lhe pediu que ficassem conversando sobre
          Deus pela noite. Ele recusou, por causa da regra de voltar ao mosteiro. Ela rezou, e uma tempestade tão forte caiu que
          ninguém pôde sair. Bento entendeu: <b>o amor vem antes da regra</b>. Esta é a lição para o seu painel: a rotina serve à vida
          e ao amor, nunca o contrário. Quando um filho adoece ou o marido precisa de você, a Hora espera.
        </p>
      </Card>

      <Card>
        <Eyebrow className="text-moss">Como a Regra virou este painel</Eyebrow>
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-ink/40">
                <th className="pb-2 pr-3">Princípio</th>
                <th className="pb-2 pr-3">Na Regra</th>
                <th className="pb-2 pr-3">Ideia</th>
                <th className="pb-2">No painel</th>
              </tr>
            </thead>
            <tbody>
              {PRINCIPIOS.map(([p, ref, ideia, onde]) => (
                <tr key={p} className="border-t border-line/60 align-top">
                  <td className="py-2 pr-3 font-semibold text-navy">{p}</td>
                  <td className="py-2 pr-3 text-ink/60 whitespace-nowrap">{ref}</td>
                  <td className="py-2 pr-3 text-ink/80">{ideia}</td>
                  <td className="py-2 text-moss">{onde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12.5px] text-ink/40 mt-4">
          As frases do painel são paráfrases livres em português, com a referência do capítulo. Para o texto integral, consulte uma
          edição da Regra de São Bento.
        </p>
      </Card>
    </div>
  );
}
