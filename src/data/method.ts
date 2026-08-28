// Conteúdo estruturado do método "Casa em Ordem", com base no PDF do curso.
// Os bancos de tarefas por cômodo (Parte 5) e o quadro de idades (Parte 8) foram
// expandidos em itens práticos a partir das descrições do método, já que o PDF
// base referencia um material bônus (checklists imprimíveis) à parte.

export interface MinimoViavelTask {
  id: string;
  label: string;
  detail: string;
  time: string;
}

export const minimoViavel: MinimoViavelTask[] = [
  {
    id: "louca",
    label: "Lavar a louça do dia",
    detail: "Não deixar acumular de uma refeição pra outra.",
    time: "5–8 min",
  },
  {
    id: "roupa",
    label: "Dobrar e guardar a roupa lavada",
    detail: "Não deixar a roupa já lavada se acumular em cima da cama ou do sofá.",
    time: "3–5 min",
  },
  {
    id: "lixo",
    label: "Tirar o lixo",
    detail: "De todos os cômodos que geram lixo.",
    time: "2 min",
  },
  {
    id: "camas",
    label: "Arrumar as camas",
    detail: "Um minuto por cama.",
    time: "1–2 min/cama",
  },
  {
    id: "chao",
    label: "Passar vassourinha ou pano no chão principal",
    detail: "Só a área de maior circulação: sala, cozinha, corredor.",
    time: "3–5 min",
  },
];

export interface ZonaTask {
  id: string;
  label: string;
  minutes: number;
}

export interface Zona {
  semana: number;
  nome: string;
  descricao: string;
  banco: ZonaTask[];
}

export const zonas: Zona[] = [
  {
    semana: 1,
    nome: "Cozinha a fundo",
    descricao: "Geladeira por dentro, fogão, armários de mantimento — não é a louça do dia, isso é diário.",
    banco: [
      { id: "z1-geladeira", label: "Limpar a geladeira por dentro (tirar tudo, jogar vencido, passar pano)", minutes: 25 },
      { id: "z1-fogao", label: "Limpar o fogão (grades, bandejas, painel)", minutes: 20 },
      { id: "z1-armarios", label: "Organizar armários de mantimento e checar validades", minutes: 20 },
      { id: "z1-microondas", label: "Limpar por dentro do micro-ondas", minutes: 10 },
      { id: "z1-portas", label: "Limpar portas e exterior dos armários da cozinha", minutes: 15 },
      { id: "z1-lixeira", label: "Lavar a lixeira da cozinha", minutes: 10 },
      { id: "z1-coifa", label: "Limpar coifa/exaustor", minutes: 15 },
    ],
  },
  {
    semana: 2,
    nome: "Quartos",
    descricao: "Guarda-roupa, gavetas, embaixo da cama, rodapés, portas, janelas.",
    banco: [
      { id: "z2-guardaroupa", label: "Organizar uma seção do guarda-roupa", minutes: 25 },
      { id: "z2-gavetas", label: "Organizar gavetas", minutes: 15 },
      { id: "z2-embaixocama", label: "Limpar embaixo da cama", minutes: 10 },
      { id: "z2-rodapes", label: "Limpar rodapés do quarto", minutes: 10 },
      { id: "z2-portas", label: "Limpar portas e maçanetas", minutes: 10 },
      { id: "z2-janelas", label: "Limpar janelas e cortinas", minutes: 20 },
    ],
  },
  {
    semana: 3,
    nome: "Banheiros",
    descricao: "Armários, box, ralo, produtos vencidos, rodapés e cantos.",
    banco: [
      { id: "z3-armarios", label: "Limpar armários e checar validade dos produtos", minutes: 15 },
      { id: "z3-box", label: "Limpar o box a fundo (rejunte, vidro)", minutes: 20 },
      { id: "z3-ralo", label: "Limpar o ralo", minutes: 10 },
      { id: "z3-rodapes", label: "Limpar rodapés e cantos", minutes: 10 },
      { id: "z3-gaveta", label: "Organizar gaveta de produtos de higiene", minutes: 10 },
      { id: "z3-tapetes", label: "Lavar tapetes do banheiro", minutes: 10 },
    ],
  },
  {
    semana: 4,
    nome: "Sala e áreas comuns",
    descricao: "Estante, home theater, mesa de jantar, tapetes, janelas.",
    banco: [
      { id: "z4-estante", label: "Limpar a estante (tirar tudo, passar pano, reorganizar)", minutes: 20 },
      { id: "z4-hometheater", label: "Limpar home theater/TV e fiação", minutes: 15 },
      { id: "z4-mesa", label: "Limpar mesa de jantar e cadeiras a fundo", minutes: 15 },
      { id: "z4-tapetes", label: "Aspirar ou lavar tapetes", minutes: 15 },
      { id: "z4-janelas", label: "Limpar janelas e cortinas da sala", minutes: 20 },
      { id: "z4-aparador", label: "Organizar gaveta ou aparador da sala", minutes: 15 },
    ],
  },
  {
    semana: 5,
    nome: "Roupa de cama/banho e área de serviço",
    descricao: "Roupa de cama e toalhas, produtos de limpeza, lavanderia.",
    banco: [
      { id: "z5-rouparcama", label: "Trocar e lavar os jogos de roupa de cama", minutes: 20 },
      { id: "z5-armario", label: "Organizar armário de roupa de cama e toalhas", minutes: 15 },
      { id: "z5-produtos", label: "Organizar produtos de limpeza e checar validades", minutes: 15 },
      { id: "z5-maquina", label: "Rodar ciclo de limpeza da máquina de lavar", minutes: 10 },
      { id: "z5-tanque", label: "Limpar área de serviço/tanque", minutes: 15 },
      { id: "z5-varal", label: "Organizar varal e utensílios de lavanderia", minutes: 10 },
    ],
  },
];

export interface TarefaRepresada {
  id: string;
  label: string;
}

export const tarefasRepresadas: TarefaRepresada[] = [
  { id: "tr-guardaroupa", label: "Fundo do guarda-roupa" },
  { id: "tr-geladeira", label: "Geladeira por dentro (a fundo)" },
  { id: "tr-areaexterna", label: "Área externa" },
  { id: "tr-prateleira", label: "Aquela prateleira que ninguém mexe" },
  { id: "tr-despensa", label: "Despensa completa" },
  { id: "tr-armariodocumentos", label: "Armário de documentos/papelada" },
];

export interface ResetStep {
  ordem: number;
  titulo: string;
  descricao: string;
}

export const resetSteps: ResetStep[] = [
  {
    ordem: 1,
    titulo: "Lixo — a casa inteira",
    descricao: "Passe por todos os cômodos recolhendo lixo, sem parar pra organizar mais nada.",
  },
  {
    ordem: 2,
    titulo: "Louça — tudo de uma vez",
    descricao: "Lave (ou coloque na máquina) toda a louça acumulada.",
  },
  {
    ordem: 3,
    titulo: "Roupa — separar e começar",
    descricao: "Separe suja de limpa. Coloque uma lavagem pra rodar. Dobre e guarde o que já estiver limpo.",
  },
  {
    ordem: 4,
    titulo: "Superfícies e chão — uma passada rápida",
    descricao: "Tire o que está fora do lugar nas superfícies principais e passe pano/vassourinha nas áreas de maior circulação.",
  },
  {
    ordem: 5,
    titulo: "Voltar ao mínimo viável, já no dia seguinte",
    descricao: "O reset termina aqui — não em uma casa perfeita, mas em uma casa sustentável de novo.",
  },
];

export interface FaixaEtaria {
  id: string;
  faixa: string;
  objetivo: string;
  tarefas: string[];
}

export const criancas: FaixaEtaria[] = [
  {
    id: "2-4",
    faixa: "2 a 4 anos",
    objetivo: "Familiaridade, não autonomia — a criança ainda precisa de ajuda.",
    tarefas: [
      "Guardar os próprios brinquedos, com companhia e incentivo",
      "Colocar a roupa suja no cesto",
      "Ajudar a carregar objetos leves",
    ],
  },
  {
    id: "5-7",
    faixa: "5 a 7 anos",
    objetivo: "Já dá pra cobrar consistência, mas não perfeição.",
    tarefas: [
      "Arrumar a própria cama (torto está ótimo)",
      "Organizar os próprios brinquedos sozinha, usando caixas grandes",
      "Ajudar a pôr a mesa",
      "Guardar a própria roupa dobrada nas gavetas certas",
    ],
  },
  {
    id: "8-10",
    faixa: "8 a 10 anos",
    objetivo: "Já consegue seguir uma rotina fixa sem supervisão constante.",
    tarefas: [
      "Dobrar a própria roupa",
      "Cuidar do mínimo viável do próprio quarto",
      "Tirar o lixo da casa",
      "Ajudar a lavar louça simples",
      "Cuidar de um animal de estimação, se houver",
    ],
  },
  {
    id: "11+",
    faixa: "A partir de 11 anos",
    objetivo: "Pode ter responsabilidade real dentro do sistema semanal.",
    tarefas: [
      "Lavar louça completa",
      "Participar de uma zona da semana, sozinha ou com você",
      "Cuidar de uma área da casa com mais autonomia",
      "Ajudar em preparos simples de comida",
      "Apoiar com irmãos mais novos em tarefas pequenas",
    ],
  },
];

export interface MomentoDia {
  id: string;
  nome: string;
  objetivo: string;
  tarefas: string[];
}

export const rotinaDiaria: MomentoDia[] = [
  {
    id: "manha",
    nome: "Manhã",
    objetivo: "Sair de casa sem deixar pendência do dia anterior — não resolver o dia inteiro antes das oito.",
    tarefas: [
      "Arrumar as camas",
      "Lavar (ou colocar na máquina) a louça do café da manhã",
      "Deixar a pia vazia antes de sair, se possível",
    ],
  },
  {
    id: "chegada",
    nome: "Chegada em casa",
    objetivo: "Os 15 minutos que decidem a noite — adiar o descanso, não abrir mão dele.",
    tarefas: [
      "Guardar bolsa, chaves e sapatos no lugar certo",
      "Fazer uma passada rápida pelo mínimo viável (ou parte dele)",
      "Envolver as crianças: mochila e sapatos delas também",
    ],
  },
  {
    id: "noite",
    nome: "Noite",
    objetivo: "Fechamento do dia — acordar amanhã sem começar em dívida.",
    tarefas: [
      "Louça do jantar lavada",
      "Lixo do dia recolhido",
      "5 minutos recolhendo brinquedos com as crianças",
      "Última olhada nas áreas principais",
    ],
  },
];

export interface Plano21Semana {
  semana: number;
  titulo: string;
  foco: string;
  descricao: string;
  dicas: string[];
}

export const plano21: Plano21Semana[] = [
  {
    semana: 1,
    titulo: "Fundação",
    foco: "Só o mínimo viável",
    descricao:
      "Nos primeiros 7 dias, o único objetivo é o mínimo viável: as cinco tarefas não negociáveis, todos os dias, sem adicionar mais nada.",
    dicas: [
      "Não se preocupe com zona do dia, sistema semanal ou rotina por tempo ainda.",
      "Se um dia for impossível e nem o mínimo viável acontecer, retome no dia seguinte sem tentar compensar.",
      "O objetivo não é perfeição, é repetição.",
    ],
  },
  {
    semana: 2,
    titulo: "Ritmo",
    foco: "Mínimo viável + sistema semanal",
    descricao:
      "O mínimo viável continua todos os dias, e você adiciona a segunda camada: o sistema semanal, com uma zona por dia, e experimenta as rotinas por tempo (15/30/60).",
    dicas: [
      "Siga a distribuição sugerida das zonas (ou sua versão adaptada).",
      "Nos dias corridos, 15 minutos já bastam. Nos dias tranquilos, 30 ou 60 minutos rendem mais do que parecia.",
      "É normal parecer mais trabalhoso — você está adicionando uma camada nova.",
    ],
  },
  {
    semana: 3,
    titulo: "Consolidação",
    foco: "Sistema completo, reset e ajustes",
    descricao:
      "O sistema já deveria estar praticamente completo. Agora é hora de testar o que acontece quando as coisas não saem como planejado — e de trazer as crianças pra dentro do sistema.",
    dicas: [
      "Se possível, deixe uma semana 'imperfeita' acontecer de propósito — pule uma zona, erre um dia — só pra praticar seguir em frente sem culpa.",
      "Se a casa realmente sair do controle, é o momento de colocar o protocolo de reset em prática.",
      "Ajuste qualquer detalhe que não estava encaixando na sua realidade.",
    ],
  },
];

export interface PontoAcumulo {
  id: string;
  nome: string;
  resumo: string;
  regras: string[];
}

export const pontosAcumulo: PontoAcumulo[] = [
  {
    id: "roupa",
    nome: "Roupa",
    resumo: "O problema nunca é a roupa suja — é a roupa já lavada, parada, esperando ser guardada.",
    regras: [
      "Roupa lavada não pode esperar mais de um dia pra ser dobrada e guardada.",
      "Uma lavagem por dia (ou a cada dois dias), nunca uma lavanderia inteira no fim de semana.",
      "Cestos separados por estado, não por pessoa: um pra roupa suja, um espaço claro só pra roupa lavada aguardando dobra.",
    ],
  },
  {
    id: "cozinha",
    nome: "Cozinha",
    resumo: "A pia vazia é o maior indicador visual de que a casa está sob controle.",
    regras: [
      "Lave enquanto cozinha, não depois de comer — aproveite os intervalos do preparo.",
      "Feche o dia com a pia vazia (já garantido pelo mínimo viável).",
      "Evite transformar a pia ou a bancada num ponto de trânsito pra coisas que não são louça.",
    ],
  },
  {
    id: "brinquedos",
    nome: "Brinquedos",
    resumo: "Poucas categorias, bem grandes, fáceis de reconhecer — o oposto de caixinhas pequenas e etiquetadas.",
    regras: [
      "3 ou 4 caixas grandes (bonecos, blocos, jogos, 'o resto') resolvem a maior parte da bagunça.",
      "Um brinquedo de cada vez, antes de pegar outro, dentro do possível pra idade.",
      "Cinco minutos antes de dormir: recolhida rápida, cada categoria de volta pra sua caixa.",
    ],
  },
];

export interface Pilar {
  id: string;
  nome: string;
  descricao: string;
}

export const pilares: Pilar[] = [
  {
    id: "minimo",
    nome: "Mínimo viável",
    descricao:
      "As poucas tarefas que, feitas todos os dias, impedem a casa de sair do controle — não é a casa perfeita, é a casa funcional.",
  },
  {
    id: "tempo",
    nome: "Tempo disponível",
    descricao:
      "Rotinas específicas pra 15, 30 e 60 minutos — você escolhe de acordo com o que sobrou do seu dia, não com o que 'deveria' fazer.",
  },
  {
    id: "ritmo",
    nome: "Ritmo semanal",
    descricao:
      "Cada tarefa tem um dia certo pra acontecer, distribuída por zonas da casa — o fim de semana deixa de ser sinônimo de faxina geral.",
  },
  {
    id: "reset",
    nome: "Reset",
    descricao:
      "Um protocolo específico pra quando tudo foge do controle, que devolve a casa ao normal sem exigir perfeição.",
  },
];

export const tresErros: string[] = [
  "Tentar fazer tudo de uma vez — guardar, limpar e organizar tudo num único dia, geralmente o sábado.",
  "Confundir arrumar com manter — arrumar é o esforço pontual; manter é o que impede a bagunça de voltar.",
  "Não ter um mínimo definido pros dias ruins — sem isso, a tendência é fazer tudo ou não fazer nada.",
];

export const rotinaTempoInfo = {
  15: {
    titulo: "15 minutos — dia corrido",
    descricao:
      "Na prática, é o mínimo viável em ação. Nos dias corridos, você não adiciona nada além dele.",
  },
  30: {
    titulo: "30 minutos — dia normal",
    descricao:
      "Mínimo viável (15 min) + uma única tarefa da zona do dia (15 min). Escolha antes de começar, não na hora.",
  },
  60: {
    titulo: "60 minutos — dia livre ou fim de semana",
    descricao:
      "Mínimo viável (15 min) + tarefa da zona do dia (15 min) + uma tarefa maior represada (30 min). Quando o tempo acabar, pare — mesmo sem terminar.",
  },
} as const;
