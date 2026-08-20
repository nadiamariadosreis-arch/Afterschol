import type { Task } from "../types";

/**
 * Banco de tarefas padrão. Inclui tarefas de casa e também tarefas de
 * autocuidado/tempo de qualidade — de propósito, para que a rotina gerada
 * nunca seja só trabalho doméstico.
 */
export const defaultTasks: Task[] = [
  // Cozinha
  { id: "lavar-louca", name: "Lavar a louça", category: "cozinha", durationMin: 15, frequency: "diaria", priority: 3, energy: "media" },
  { id: "limpar-pia-fogao", name: "Limpar pia e fogão", category: "cozinha", durationMin: 10, frequency: "diaria", priority: 2, energy: "baixa" },
  { id: "organizar-geladeira", name: "Organizar a geladeira", category: "cozinha", durationMin: 20, frequency: "semanal", priority: 2, energy: "media" },
  { id: "lista-compras", name: "Fazer lista de compras", category: "cozinha", durationMin: 15, frequency: "semanal", priority: 2, energy: "baixa" },
  { id: "planejar-cardapio", name: "Planejar o cardápio da semana", category: "cozinha", durationMin: 20, frequency: "semanal", priority: 2, energy: "baixa" },
  { id: "preparar-marmitas", name: "Preparar marmitas/lanches para a semana", category: "cozinha", durationMin: 40, frequency: "semanal", priority: 2, energy: "alta" },
  { id: "limpar-micro-fogao", name: "Limpar micro-ondas e fogão por dentro", category: "cozinha", durationMin: 15, frequency: "semanal", priority: 1, energy: "media" },

  // Limpeza
  { id: "varrer-aspirar", name: "Varrer ou aspirar a casa", category: "limpeza", durationMin: 25, frequency: "semanal", priority: 2, energy: "alta" },
  { id: "passar-pano-chao", name: "Passar pano no chão", category: "limpeza", durationMin: 25, frequency: "semanal", priority: 2, energy: "alta" },
  { id: "limpar-banheiro", name: "Limpar o banheiro", category: "limpeza", durationMin: 25, frequency: "semanal", priority: 3, energy: "alta" },
  { id: "limpar-vidros", name: "Limpar vidros e espelhos", category: "limpeza", durationMin: 20, frequency: "quinzenal", priority: 1, energy: "media" },
  { id: "tirar-lixo", name: "Tirar o lixo", category: "limpeza", durationMin: 5, frequency: "diaria", priority: 3, energy: "baixa" },
  { id: "arrumar-camas", name: "Arrumar as camas", category: "limpeza", durationMin: 10, frequency: "diaria", priority: 2, energy: "baixa" },
  { id: "trocar-roupa-cama", name: "Trocar a roupa de cama", category: "limpeza", durationMin: 15, frequency: "semanal", priority: 2, energy: "media" },
  { id: "regar-plantas", name: "Regar as plantas", category: "limpeza", durationMin: 10, frequency: "semanal", priority: 1, energy: "baixa" },

  // Roupas
  { id: "colocar-lavar-roupa", name: "Colocar roupa para lavar", category: "roupas", durationMin: 10, frequency: "semanal", priority: 2, energy: "baixa" },
  { id: "estender-roupa", name: "Estender roupa", category: "roupas", durationMin: 15, frequency: "semanal", priority: 2, energy: "media" },
  { id: "dobrar-guardar-roupa", name: "Dobrar e guardar roupas", category: "roupas", durationMin: 20, frequency: "semanal", priority: 2, energy: "media" },
  { id: "passar-roupa", name: "Passar roupa", category: "roupas", durationMin: 30, frequency: "semanal", priority: 1, energy: "media" },

  // Organização
  { id: "organizar-brinquedos", name: "Organizar brinquedos", category: "organizacao", durationMin: 10, frequency: "diaria", priority: 2, energy: "baixa" },
  { id: "organizar-armario", name: "Organizar um armário", category: "organizacao", durationMin: 45, frequency: "mensal", priority: 1, energy: "alta" },
  { id: "organizar-papelada", name: "Organizar papelada e documentos", category: "organizacao", durationMin: 25, frequency: "mensal", priority: 1, energy: "media" },

  // Finanças
  { id: "pagar-contas", name: "Pagar contas e organizar finanças", category: "financas", durationMin: 30, frequency: "mensal", priority: 3, energy: "media" },

  // Crianças
  { id: "licao-de-casa", name: "Ajudar com a lição de casa", category: "criancas", durationMin: 30, frequency: "diaria", priority: 3, energy: "media" },
  { id: "preparar-mochila", name: "Preparar a mochila/material escolar", category: "criancas", durationMin: 10, frequency: "diaria", priority: 2, energy: "baixa" },

  // Autocuidado (de propósito, para equilibrar a rotina)
  { id: "momento-autocuidado", name: "Um momento só seu — respirar, tomar um café em paz", category: "autocuidado", durationMin: 15, frequency: "diaria", priority: 3, energy: "baixa" },
  { id: "tempo-qualidade-filhos", name: "Tempo de qualidade com as crianças (sem tarefas)", category: "criancas", durationMin: 20, frequency: "diaria", priority: 3, energy: "media" },
  { id: "atividade-fisica", name: "Alongar ou fazer uma caminhada curta", category: "autocuidado", durationMin: 15, frequency: "semanal", priority: 2, energy: "media" },
];
