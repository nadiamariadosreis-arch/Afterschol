export type ProfileId = "culpada" | "calada" | "chorona";

export type Profile = {
  id: ProfileId;
  emoji: string;
  name: string;
  tagline: string;
  diagnosis: string;
  signs: string[];
  whatHelps: string[];
  prayer: string;
};

export type Question = {
  text: string;
  answers: { text: string; profile: ProfileId }[];
};

export const PROFILES: Record<ProfileId, Profile> = {
  culpada: {
    id: "culpada",
    emoji: "🫠",
    name: "A Impaciente e Culpada",
    tagline: "Você levanta a voz e passa o resto do dia se cobrando.",
    diagnosis:
      "Você ama muito e quer fazer tudo certo. Por isso, cada grito vira uma sentença: 'sou uma mãe ruim'. A impaciência dura minutos; a culpa dura o dia inteiro. O problema não é falta de amor, é excesso de cobrança sobre você mesma.",
    signs: [
      "Pede desculpas aos filhos várias vezes ao dia",
      "Repassa mentalmente o que disse errado antes de dormir",
      "Compara-se com outras mães e sempre sai perdendo",
      "Compensa a bronca com presentes, doces ou telas",
    ],
    whatHelps: [
      "Troque 'sou uma mãe horrível' por 'perdi a paciência, e posso reparar'",
      "Peça desculpas uma vez, com calma, e siga em frente",
      "Escolha uma única coisa para melhorar esta semana, não dez",
      "Lembre-se: a mãe perfeita não existe, a mãe que repara existe",
    ],
    prayer:
      "Senhor, ensina-me a aceitar a Tua misericórdia como aceito a dos meus filhos. Que eu corrija com amor e me perdoe com ternura.",
  },
  calada: {
    id: "calada",
    emoji: "🌋",
    name: "A Impaciente e Calada",
    tagline: "Você engole tudo por fora e ferve por dentro.",
    diagnosis:
      "Ninguém percebe que você está no limite, porque você segura, sorri e segue. Só que a paciência engolida não some: ela vira cara fechada, respostas curtas, suspiros e um cansaço que pesa no corpo. Você tem medo de explodir, então se fecha.",
    signs: [
      "Fica em silêncio pesado quando está irritada",
      "Responde seco e depois se isola em outro cômodo",
      "Sente que ninguém vê o quanto você carrega",
      "Cansaço constante, dor de cabeça ou nó na garganta",
    ],
    whatHelps: [
      "Nomeie o que sente em voz alta: 'estou cansada, preciso de cinco minutos'",
      "Peça ajuda de forma clara, não espere que adivinhem",
      "Crie uma pausa diária só sua, mesmo que curta",
      "Converse com alguém de confiança antes de chegar ao limite",
    ],
    prayer:
      "Senhor, Tu conheces o que eu não consigo dizer. Dá-me coragem para pedir ajuda e descanso para o meu coração cansado.",
  },
  chorona: {
    id: "chorona",
    emoji: "🌧️",
    name: "A que Perde a Paciência e Depois Chora",
    tagline: "A tempestade vem rápida, e o choro vem logo depois.",
    diagnosis:
      "Você acumula, acumula e, de repente, estoura. Em seguida, vem o arrependimento e as lágrimas, às vezes no banheiro, às vezes abraçada ao seu filho. Isso mostra um coração sensível que sente muito e precisa de válvulas de escape antes do limite.",
    signs: [
      "Reação forte e rápida a coisas pequenas",
      "Chora sozinha ou junto com a criança depois do conflito",
      "Promete que 'amanhã vai ser diferente' e repete o ciclo",
      "Dias bons e dias de explosão, sem meio-termo",
    ],
    whatHelps: [
      "Identifique seus gatilhos: fome, sono, horário, bagunça",
      "Combine um sinal ou palavra para sair da sala antes de explodir",
      "Respire fundo contando até dez e beba água antes de responder",
      "Depois do choro, repare com um abraço e uma conversa simples",
    ],
    prayer:
      "Senhor, acalma a tempestade dentro de mim. Que as minhas lágrimas me aproximem de Ti e dos meus filhos, e não me afastem.",
  },
};

export const QUESTIONS: Question[] = [
  {
    text: "Seu filho derruba o suco no chão recém-limpo. Qual é a sua primeira reação?",
    answers: [
      { text: "Falo mais alto do que queria e logo me sinto péssima", profile: "culpada" },
      { text: "Respiro fundo, não falo nada e limpo em silêncio, fervendo", profile: "calada" },
      { text: "Grito, e logo depois sinto vontade de chorar", profile: "chorona" },
    ],
  },
  {
    text: "Depois de uma discussão com seu filho, o que passa na sua cabeça?",
    answers: [
      { text: "'Que tipo de mãe eu sou?' Fico me cobrando por horas", profile: "culpada" },
      { text: "Nada. Me fecho e fico quieta até passar", profile: "calada" },
      { text: "Choro, peço desculpas e prometo que vou melhorar", profile: "chorona" },
    ],
  },
  {
    text: "Quando você está no limite, seu corpo mostra como?",
    answers: [
      { text: "Aperto no peito e pensamentos de que estou falhando", profile: "culpada" },
      { text: "Mandíbula travada, dor de cabeça e respostas curtas", profile: "calada" },
      { text: "Coração acelerado, tremor e voz que sobe sem eu perceber", profile: "chorona" },
    ],
  },
  {
    text: "Como as pessoas de casa percebem que você está irritada?",
    answers: [
      { text: "Percebem quando eu me desculpo demais depois", profile: "culpada" },
      { text: "Quase ninguém percebe, eu disfarço bem", profile: "calada" },
      { text: "Percebem na hora, porque eu estouro", profile: "chorona" },
    ],
  },
  {
    text: "Seu filho está há 20 minutos enrolando para se arrumar e você está atrasada.",
    answers: [
      { text: "Apresso gritando e depois compenso com um agrado", profile: "culpada" },
      { text: "Faço tudo eu mesma, calada e emburrada", profile: "calada" },
      { text: "Perco a paciência e, no carro, me dá vontade de chorar", profile: "chorona" },
    ],
  },
  {
    text: "Qual frase mais se parece com o que você pensa de si mesma?",
    answers: [
      { text: "'Eu deveria ser mais paciente. Estou falhando com eles'", profile: "culpada" },
      { text: "'Ninguém vê o quanto eu aguento'", profile: "calada" },
      { text: "'Eu não queria ter falado daquele jeito'", profile: "chorona" },
    ],
  },
  {
    text: "Quando você precisa de ajuda, o que costuma fazer?",
    answers: [
      { text: "Me sinto culpada de pedir, então faço sozinha", profile: "culpada" },
      { text: "Espero que alguém perceba sem eu precisar dizer", profile: "calada" },
      { text: "Peço quando já estou chorando ou explodindo", profile: "chorona" },
    ],
  },
  {
    text: "À noite, com os filhos dormindo, como você se sente?",
    answers: [
      { text: "Reviso o dia e listo tudo que fiz de errado", profile: "culpada" },
      { text: "Exausta, esgotada, só quero silêncio", profile: "calada" },
      { text: "Choro, olho as crianças dormindo e me arrependo do dia", profile: "chorona" },
    ],
  },
  {
    text: "Qual destas situações mais te tira do sério?",
    answers: [
      { text: "Quando comparo minha rotina com a de outras mães", profile: "culpada" },
      { text: "Quando sinto que carrego tudo e ninguém reconhece", profile: "calada" },
      { text: "Quando pedem a mesma coisa mil vezes seguidas", profile: "chorona" },
    ],
  },
  {
    text: "O que você mais deseja mudar na sua maternidade?",
    answers: [
      { text: "Parar de me cobrar tanto e me perdoar mais", profile: "culpada" },
      { text: "Conseguir falar o que sinto sem me fechar", profile: "calada" },
      { text: "Ter mais calma antes de explodir", profile: "chorona" },
    ],
  },
];
