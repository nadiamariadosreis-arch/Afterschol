// Conteúdo estático do painel, inspirado na Regra de São Bento (c. 530).
// As frases são paráfrases livres em português, com a referência do capítulo.

export type AreaId = "deus" | "trabalho" | "casa" | "filhos" | "esposo" | "eu" | "instagram";

export const AREAS: {
  id: AreaId;
  nome: string;
  icon: string;
  color: string;
  principio: string;
  acoes: string[];
}[] = [
  {
    id: "deus",
    nome: "Deus e oração",
    icon: "✝️",
    color: "#b08d45",
    principio: "Nada se anteponha à Obra de Deus (RB 43)",
    acoes: ["Rezar 10 min em silêncio antes de qualquer tela", "Ler o Evangelho do dia", "Participar de uma Missa na semana"],
  },
  {
    id: "trabalho",
    nome: "Trabalho fora",
    icon: "💼",
    color: "#333a4d",
    principio: "Trabalho oferecido a Deus (RB 48 e 57)",
    acoes: ["Definir 1 prioridade do dia antes de abrir e-mails", "Fazer uma pausa real no almoço", "Encerrar o expediente na hora combinada"],
  },
  {
    id: "casa",
    nome: "Casa",
    icon: "🏡",
    color: "#4a5d45",
    principio: "A despenseira cuida de tudo como vasos sagrados (RB 31)",
    acoes: ["Fazer só a zona do dia (15–30 min)", "Planejar o cardápio da semana", "Pedir ajuda de cada um da família"],
  },
  {
    id: "filhos",
    nome: "Filhos",
    icon: "🧒",
    color: "#e2632f",
    principio: "Dar a cada um conforme a necessidade (RB 34)",
    acoes: ["15 min de colo/brincadeira sem celular", "Ouvir um filho sem interromper", "Rezar com eles antes de dormir"],
  },
  {
    id: "esposo",
    nome: "Esposo",
    icon: "💍",
    color: "#a4644c",
    principio: "Suportar com paciência e buscar o bem do outro (RB 72)",
    acoes: ["Conversa a dois de 15 min sem telas", "Agradecer algo concreto ao marido", "Marcar um encontro do casal no mês"],
  },
  {
    id: "eu",
    nome: "Eu mesma",
    icon: "🌿",
    color: "#7b6a9b",
    principio: "Discrição, mãe das virtudes: medida também para si (RB 64)",
    acoes: ["Dormir antes das 22h30", "Caminhar ou alongar 20 min", "15 min de silêncio ou leitura só para você"],
  },
  {
    id: "instagram",
    nome: "Instagram",
    icon: "📸",
    color: "#3d7f8c",
    principio: "O trabalho tem hora marcada e hora de acabar (RB 48)",
    acoes: ["Anotar 3 ideias de post", "Gravar/produzir em lote em 1 bloco", "Responder comentários como quem acolhe hóspedes"],
  },
];

export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<AreaId, (typeof AREAS)[number]>;

// ─── As Horas ─────────────────────────────────────────────────────────────

export type HoraMeta = {
  id: string;
  nome: string;
  icon: string;
  accent: string;
  time: string;
  lema: string;
  ref: string;
  desc: string;
  tasks: string[];
};

export const HORAS: HoraMeta[] = [
  {
    id: "vigilias",
    nome: "Vigílias",
    icon: "🌙",
    accent: "#333a4d",
    time: "05:30",
    lema: "O silêncio antes da casa acordar",
    ref: "RB 8 e 22",
    desc: "Os monges se levantavam ainda de noite para rezar enquanto o mundo dormia. Para você: um pedaço do dia que é só seu e de Deus, antes que as demandas comecem.",
    tasks: ["10 min de silêncio e oração", "Ler o Evangelho do dia (lectio divina)", "Um copo d'água e alongar"],
  },
  {
    id: "laudes",
    nome: "Laudes",
    icon: "☀️",
    accent: "#b08d45",
    time: "06:30",
    lema: "Oferecer o dia a Deus",
    ref: "RB 12 e 13",
    desc: "A oração da aurora: o dia começa com louvor, não com urgência. É o momento de oferecer o trabalho, os filhos e a casa.",
    tasks: ["Oferecimento do dia em família", "Café da manhã sem pressa com os filhos", "Arrumar a cama e a cozinha (5 min)"],
  },
  {
    id: "prima",
    nome: "Prima",
    icon: "🗓️",
    accent: "#4a5d45",
    time: "07:15",
    lema: "Ordenar o dia",
    ref: "RB 16",
    desc: "Começar com ordem. Olhe o dia inteiro de uma vez e escolha o essencial, para não ser levada pelas urgências dos outros.",
    tasks: ["Olhar os 3 essenciais do dia", "Conferir mochilas, marmitas e roupas", "Beijo e bênção na saída"],
  },
  {
    id: "terca",
    nome: "Terça",
    icon: "💼",
    accent: "#2f6d8a",
    time: "09:00",
    lema: "Trabalho oferecido",
    ref: "RB 48 e 57",
    desc: "Hora de trabalhar de verdade. O trabalho fora de casa também é Opus: feito com atenção, sem murmuração, para que em tudo Deus seja glorificado.",
    tasks: ["Oração curta antes de começar", "Bloco principal de foco (sem distração)", "Uma coisa de cada vez"],
  },
  {
    id: "sexta",
    nome: "Sexta",
    icon: "🍞",
    accent: "#c58a1f",
    time: "12:30",
    lema: "A pausa do meio-dia",
    ref: "RB 38 a 41",
    desc: "O ponto mais alto do sol pede pausa. Comer com calma, respirar e lembrar quem você está servindo.",
    tasks: ["Almoço sem tela", "5 min de pausa e respiração", "Mensagem de carinho ao marido ou aos filhos"],
  },
  {
    id: "noa",
    nome: "Noa",
    icon: "🕊️",
    accent: "#8a6f9e",
    time: "15:30",
    lema: "Recomeçar com humildade",
    ref: "RB 4 e 16",
    desc: "A tarde pesa. A Regra ensina a nunca desanimar da misericórdia de Deus: se a manhã saiu torta, recomeça-se aqui.",
    tasks: ["Oração rápida (Angelus ou Ave-Maria)", "Anotar uma ideia de post (10 min)", "Definir o jantar de hoje"],
  },
  {
    id: "vesperas",
    nome: "Vésperas",
    icon: "🏡",
    accent: "#e2632f",
    time: "18:30",
    lema: "O retorno ao lar: hospitalidade",
    ref: "RB 35 e 53",
    desc: "“Todos os hóspedes sejam recebidos como Cristo.” Os primeiros hóspedes da mãe que chega em casa são o marido e os filhos.",
    tasks: ["Chegar e acolher cada filho (celular guardado)", "Jantar em família", "Mutirão: cada um ajuda em algo", "Oração em família"],
  },
  {
    id: "completas",
    nome: "Completas",
    icon: "🕯️",
    accent: "#4a3f6b",
    time: "21:00",
    lema: "Fechar o dia em paz",
    ref: "RB 42",
    desc: "Depois de Completas, silêncio. É a hora de entregar o dia a Deus, cuidar do casal e deixar a cama chegar cedo.",
    tasks: [
      "Conversa a dois, 15 min sem telas",
      "Bloco Instagram (30 min) · seg, qua e sex",
      "Exame do dia e 3 gratidões",
      "Deixar o amanhã preparado",
      "Silêncio e cama às 22h30",
    ],
  },
];

// ─── Lectio: frases da Regra ──────────────────────────────────────────────

export const LECTIO: { texto: string; ref: string; reflexao: string; pratica: string }[] = [
  {
    texto: "Escuta… e inclina o ouvido do teu coração.",
    ref: "Prólogo, 1",
    reflexao: "A Regra começa pelo ouvir. Antes de resolver, de responder, de postar: escutar.",
    pratica: "Hoje, ouça uma pessoa por 5 minutos sem interromper e sem olhar o celular.",
  },
  {
    texto: "Quando começares qualquer boa obra, pede a Deus com insistência que a leve à perfeição.",
    ref: "Prólogo, 4",
    reflexao: "Nenhum trabalho começa bem sem uma oração, nem a planilha, nem a louça.",
    pratica: "Antes de abrir o computador ou o Instagram, faça uma oração de 10 segundos.",
  },
  {
    texto: "Nada anteponhas ao amor de Cristo.",
    ref: "cap. 4, 21",
    reflexao: "Quando tudo parecer prioridade, pergunte: qual escolha é mais amor hoje?",
    pratica: "Em cada conflito de agenda, escolha pelo amor, não pelo ruído.",
  },
  {
    texto: "E nunca desesperar da misericórdia de Deus.",
    ref: "cap. 4, 74",
    reflexao: "Dia ruim não é dia perdido. A Regra é feita para quem recomeça.",
    pratica: "Se o dia desandou, recomece na próxima Hora com uma só tarefa pequena.",
  },
  {
    texto: "Ao discípulo convém calar e escutar.",
    ref: "cap. 6, 6",
    reflexao: "O silêncio não é vazio: é o espaço onde a alma respira.",
    pratica: "Reserve 10 minutos de silêncio sem tela.",
  },
  {
    texto: "Considere todos os utensílios e bens do mosteiro como vasos sagrados do altar.",
    ref: "cap. 31, 10",
    reflexao: "A casa não é um peso: lavar, guardar e cuidar também é culto quando feito com amor.",
    pratica: "Faça a tarefa doméstica de hoje devagar, como quem toca em algo sagrado.",
  },
  {
    texto: "Distribua-se a cada um conforme a necessidade.",
    ref: "cap. 34, 1",
    reflexao: "Justiça em casa não é tratar todo mundo igual, é dar a cada um o de que precisa.",
    pratica: "Pergunte a cada filho: do que você precisa de mim hoje?",
  },
  {
    texto: "Antes de tudo e acima de tudo, cuide-se dos doentes, como se fossem o próprio Cristo.",
    ref: "cap. 36, 1",
    reflexao: "O cuidado vale também para você. Descansar quando está esgotada é obediência, não luxo.",
    pratica: "Se estiver exausta, cancele uma coisa não essencial hoje.",
  },
  {
    texto: "A ociosidade é inimiga da alma: em certas horas, o trabalho manual; em outras, a leitura divina.",
    ref: "cap. 48, 1",
    reflexao: "A saúde da alma está no ritmo: alternar trabalho e oração, esforço e descanso.",
    pratica: "Troque dez minutos de rolagem de feed por dez minutos de leitura.",
  },
  {
    texto: "Todos os hóspedes que chegarem sejam recebidos como Cristo.",
    ref: "cap. 53, 1",
    reflexao: "Quem chega do trabalho, da escola e da rua merece ser recebido com atenção.",
    pratica: "Ao chegar em casa, deixe o celular na bolsa e abrace cada um primeiro.",
  },
  {
    texto: "Para que em tudo Deus seja glorificado.",
    ref: "cap. 57, 9",
    reflexao: "Reunião, fralda, post, panela: nada é pequeno quando é oferecido.",
    pratica: "Ofereça em voz baixa a tarefa mais chata de hoje.",
  },
  {
    texto: "Disponha tudo de modo que haja o que os fortes desejem e os fracos não fujam.",
    ref: "cap. 64, 19",
    reflexao: "Rotina boa é a que você consegue cumprir. A discrição é a mãe das virtudes.",
    pratica: "Reduza hoje uma meta pela metade e cumpra-a inteira.",
  },
  {
    texto: "Suportem com paciência as fraquezas uns dos outros. Ninguém busque o que julga útil para si, mas o que é útil ao outro.",
    ref: "cap. 72, 5 e 7",
    reflexao: "O casamento é uma escola de paciência mútua, e a regra de vida da casa é servir.",
    pratica: "Faça uma gentileza concreta ao seu marido sem esperar retorno.",
  },
  {
    texto: "Nada se anteponha à Obra de Deus.",
    ref: "cap. 43, 3",
    reflexao: "O que vem primeiro organiza o que vem depois. A oração não pode ser a sobra do dia.",
    pratica: "Rezar antes de pegar o celular de manhã.",
  },
  {
    texto: "Estejamos de tal modo na presença de Deus que a mente concorde com a voz.",
    ref: "cap. 19, 7",
    reflexao: "Presença: estar inteira onde se está. Uma coisa de cada vez.",
    pratica: "Durante a refeição, só a refeição.",
  },
  {
    texto: "Que os irmãos sirvam uns aos outros.",
    ref: "cap. 35, 1",
    reflexao: "Na comunidade, ninguém está isento do serviço. A casa é de todos, não só da mãe.",
    pratica: "Dê a cada filho, hoje, uma pequena função da casa.",
  },
  {
    texto: "Cada um tem de Deus o seu próprio dom, um de um modo, outro de outro.",
    ref: "cap. 40, 1",
    reflexao: "Não compare seu ritmo, sua casa ou seu perfil com o de ninguém.",
    pratica: "Hoje, não compare. Celebre uma pequena vitória sua.",
  },
  {
    texto: "Faça-se tudo sem murmuração.",
    ref: "cap. 40, 9",
    reflexao: "Reclamar torna pesado o que seria só difícil.",
    pratica: "Troque uma reclamação do dia por uma oferta em silêncio.",
  },
];

// ─── Casa: zonas da semana (0 = segunda … 6 = domingo) ───────────────────

export const ZONAS: { nome: string; icon: string; tasks: string[] }[] = [
  { nome: "Cozinha a fundo", icon: "🍳", tasks: ["Geladeira: jogar fora o vencido", "Fogão e bancadas", "Chão da cozinha"] },
  { nome: "Banheiros", icon: "🛁", tasks: ["Pia e espelho", "Vaso e box", "Trocar toalhas"] },
  { nome: "Quartos", icon: "🛏️", tasks: ["Trocar roupa de cama", "Organizar um armário ou gaveta", "Passar pano no chão"] },
  { nome: "Sala e áreas comuns", icon: "🛋️", tasks: ["Tirar o pó", "Aspirar ou varrer", "Organizar brinquedos e papéis"] },
  { nome: "Roupas e organização", icon: "🧺", tasks: ["Lavar e dobrar roupas", "Separar o que passar", "Preparar roupas da semana seguinte"] },
  { nome: "Compras e mutirão em família", icon: "🛒", tasks: ["Feira e mercado (use a lista)", "Mutirão: cada um com uma função", "Preparar marmitas da semana"] },
  { nome: "Dia do Senhor: descanse", icon: "🕊️", tasks: ["Missa e almoço em família", "Nada de faxina pesada", "Escolher o cardápio da semana"] },
];

export const MICRO_DIARIO = ["Lavar a louça do dia", "Tirar o lixo", "Arrumar a sala (10 min)", "Separar a roupa de amanhã"];

// ─── Hábitos ─────────────────────────────────────────────────────────────

export type HabitoGroup = "deus" | "eu" | "esposo" | "filhos";

export const HABITO_GROUPS: { id: HabitoGroup; nome: string; icon: string; color: string }[] = [
  { id: "deus", nome: "Deus", icon: "✝️", color: "#b08d45" },
  { id: "eu", nome: "Eu mesma", icon: "🌿", color: "#7b6a9b" },
  { id: "esposo", nome: "Esposo", icon: "💍", color: "#a4644c" },
  { id: "filhos", nome: "Filhos", icon: "🧒", color: "#e2632f" },
];

export const HABITOS_PADRAO: { name: string; group: HabitoGroup }[] = [
  { name: "Oração da manhã", group: "deus" },
  { name: "Lectio: 5 min com o Evangelho", group: "deus" },
  { name: "Caminhada ou alongamento (20 min)", group: "eu" },
  { name: "Beber 2 litros de água", group: "eu" },
  { name: "Dormir antes das 22h30", group: "eu" },
  { name: "Conversa a dois sem telas", group: "esposo" },
  { name: "Um gesto de carinho ou elogio", group: "esposo" },
  { name: "15 min de brincadeira ou leitura", group: "filhos" },
  { name: "Oração em família", group: "filhos" },
];

export const IG_STATUS = ["Ideia", "Roteiro", "Pronto", "Postado"] as const;

// ─── Estado padrão ────────────────────────────────────────────────────────

export type Tarefa = { id: string; text: string; area: AreaId; date: string; done: boolean };
export type Habito = { id: string; name: string; group: HabitoGroup };
export type Ideia = { id: string; text: string; status: 0 | 1 | 2 | 3; postedAt?: string };
export type Review = { intencao: string; gratidao: string; ajustar: string };
export type HoraState = { time: string; tasks: { id: string; text: string }[] };

export type PainelState = {
  horas: Record<string, HoraState>;
  checks: Record<string, true>;
  tarefas: Tarefa[];
  habitos: Habito[];
  ideias: Ideia[];
  igMeta: number;
  roda: Record<AreaId, number>;
  reviews: Record<string, Review>;
  refeicoes: Record<string, string>;
  compras: { id: string; text: string; done: boolean }[];
};

export const DEFAULT_STATE: PainelState = {
  horas: Object.fromEntries(
    HORAS.map((h) => [
      h.id,
      { time: h.time, tasks: h.tasks.map((text, i) => ({ id: `${h.id}-${i}`, text })) },
    ]),
  ),
  checks: {},
  tarefas: [],
  habitos: HABITOS_PADRAO.map((h, i) => ({ id: `h${i}`, ...h })),
  ideias: [],
  igMeta: 3,
  roda: { deus: 5, trabalho: 5, casa: 5, filhos: 5, esposo: 5, eu: 5, instagram: 5 },
  reviews: {},
  refeicoes: {},
  compras: [],
};
