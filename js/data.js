// Conteúdo catequético. Cada módulo é um array de "itens" (mandamento, oração, etc.)
// com o texto exatamente como deve ser memorizado.

const MODULOS = {
  mandamentos: {
    titulo: "Os Dez Mandamentos",
    corTema: "#7c3aed",
    itens: [
      {
        numero: 1,
        rotulo: "1º Mandamento",
        texto: "Amar a Deus sobre todas as coisas.",
      },
      {
        numero: 2,
        rotulo: "2º Mandamento",
        texto: "Não tomar o santo nome de Deus em vão.",
      },
      {
        numero: 3,
        rotulo: "3º Mandamento",
        texto: "Guardar domingos e festas de guarda.",
      },
    ],
  },
};

// Outros módulos citados pela Nádia, ainda sem conteúdo implementado
// (aparecem na tela inicial como "em breve" até a gente povoar o conteúdo).
const MODULOS_EM_BREVE = [
  { chave: "sacramentos", titulo: "Os Sacramentos" },
  { chave: "oracoes", titulo: "Orações (Pai Nosso, Ave Maria, Anjo da Guarda...)" },
  { chave: "pecados_capitais", titulo: "Os Sete Pecados Capitais" },
  { chave: "dons_espirito_santo", titulo: "Os Dons do Espírito Santo" },
  { chave: "frutos_espirito_santo", titulo: "Os Frutos do Espírito Santo" },
];
