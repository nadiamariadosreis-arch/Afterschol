import type { jsPDF } from 'jspdf'
import type { TaskCategory } from '../types'

export type IconKey =
  | 'toothbrush'
  | 'bathtub'
  | 'comb'
  | 'nail'
  | 'shirt'
  | 'shoes'
  | 'basket'
  | 'bed'
  | 'backpack'
  | 'book'
  | 'plate'
  | 'cup'
  | 'dish'
  | 'broom'
  | 'trash'
  | 'plant'
  | 'garden'
  | 'paw'
  | 'chicken'
  | 'horse'
  | 'heart'
  | 'star'
  | 'clock'
  | 'ball'
  | 'music'
  | 'house'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const KEYWORD_RULES: [RegExp, IconKey][] = [
  [/dente/, 'toothbrush'],
  [/banho/, 'bathtub'],
  [/cabelo/, 'comb'],
  [/unha/, 'nail'],
  [/mochila/, 'backpack'],
  [/lancheira/, 'backpack'],
  [/(sapato|tenis|calcado|calcar)/, 'shoes'],
  [/(cesto|cesta|dobrar|varal|roupa suja)/, 'basket'],
  [/(roupa|vestir|pijama|uniforme|gaveta|armario)/, 'shirt'],
  [/(cama|travesseiro|cobert|len[cç]ol|quarto)/, 'bed'],
  [/(livro|licao|estud|caderno|agenda|prova|materia)/, 'book'],
  [/(louca|utensilio)/, 'dish'],
  [/(mesa|prato|refeicao|almo[cç]|jantar|cafe|lanche|comida(?!.*animal)|alimento)/, 'plate'],
  [/(copo|agua(?!.*planta)|beber)/, 'cup'],
  [/(varrer|p[oó]|limpar|superficie|banheiro|sala)/, 'broom'],
  [/(lixo|reciclagem|lixeira)/, 'trash'],
  [/(horta|semente|colher|canteiro)/, 'garden'],
  [/(planta|vaso|jardim|regar|folha)/, 'plant'],
  [/(galinha|ovo)/, 'chicken'],
  [/cavalo/, 'horse'],
  [/(cachorro|gato|animal|pet|ra[cç][aã]o)/, 'paw'],
  [/(instrumento|musica)/, 'music'],
  [/(brincar|brinquedo|lazer|desenh|tela)/, 'ball'],
  [/(rotina|horario|planej|agenda|conferir|consultar)/, 'clock'],
  [/(casa|ambiente|receber|evento)/, 'house'],
  [/(familia|ajudar|irm[aã]o|compartilh)/, 'heart'],
]

export function pickTaskIconKey(name: string, category: TaskCategory): IconKey {
  const n = normalize(name)
  for (const [re, key] of KEYWORD_RULES) {
    if (re.test(n)) return key
  }
  const byCategory: Record<TaskCategory, IconKey> = {
    higiene: 'toothbrush',
    organizacao: 'shirt',
    alimentacao: 'plate',
    estudos: 'book',
    casa: 'house',
    animais: 'paw',
    jardim: 'plant',
    autocuidado: 'star',
    social: 'heart',
    lazer: 'ball',
    outro: 'star',
  }
  return byCategory[category]
}

// Ilustrações vetoriais — desenhadas com formas (não fotos), já que jsPDF não
// renderiza emoji (fontes padrão não têm esses glifos). Cada ícone é escolhido
// por palavra-chave no nome da tarefa (ver pickTaskIconKey), não só pela
// categoria — garante variedade visual real entre tarefas do mesmo grupo.
export function drawTaskIcon(doc: jsPDF, icon: IconKey, cx: number, cy: number, size: number, bg: string) {
  const r = size / 2
  doc.setFillColor(bg)
  doc.circle(cx, cy, r, 'F')
  doc.setDrawColor(255, 255, 255)
  doc.setFillColor(255, 255, 255)

  const s = size * 0.5

  switch (icon) {
    case 'toothbrush': {
      doc.setLineWidth(size * 0.16)
      doc.setLineCap?.('round')
      doc.line(cx - s * 0.4, cy + s * 0.45, cx + s * 0.3, cy - s * 0.35)
      doc.roundedRect(cx + s * 0.08, cy - s * 0.55, s * 0.42, s * 0.32, 0.8, 0.8, 'F')
      break
    }
    case 'bathtub': {
      doc.roundedRect(cx - s * 0.55, cy - s * 0.05, s * 1.1, s * 0.45, s * 0.2, s * 0.2, 'F')
      doc.setLineWidth(size * 0.08)
      doc.line(cx - s * 0.55, cy + s * 0.15, cx - s * 0.68, cy + s * 0.15)
      doc.circle(cx - s * 0.15, cy - s * 0.35, s * 0.14, 'F')
      break
    }
    case 'comb': {
      doc.roundedRect(cx - s * 0.5, cy - s * 0.5, s, s * 0.28, 1, 1, 'F')
      doc.setLineWidth(size * 0.08)
      for (let i = -3; i <= 3; i++) {
        doc.line(cx + i * s * 0.14, cy - s * 0.22, cx + i * s * 0.14, cy + s * 0.5)
      }
      break
    }
    case 'nail': {
      doc.ellipse(cx, cy, s * 0.3, s * 0.48, 'F')
      doc.setFillColor(bg)
      doc.ellipse(cx, cy - s * 0.1, s * 0.16, s * 0.26, 'F')
      break
    }
    case 'shirt': {
      doc.triangle(cx - s * 0.5, cy - s * 0.3, cx - s * 0.22, cy - s * 0.52, cx, cy - s * 0.28, 'F')
      doc.triangle(cx + s * 0.5, cy - s * 0.3, cx + s * 0.22, cy - s * 0.52, cx, cy - s * 0.28, 'F')
      doc.roundedRect(cx - s * 0.32, cy - s * 0.4, s * 0.64, s * 0.9, 1.2, 1.2, 'F')
      break
    }
    case 'shoes': {
      doc.roundedRect(cx - s * 0.5, cy - s * 0.1, s * 0.6, s * 0.35, s * 0.15, s * 0.15, 'F')
      doc.triangle(cx - s * 0.05, cy - s * 0.1, cx + s * 0.45, cy - s * 0.1, cx + s * 0.45, cy + s * 0.1, 'F')
      doc.setFillColor(bg)
      doc.rect(cx - s * 0.4, cy - s * 0.32, s * 0.5, s * 0.14, 'F')
      break
    }
    case 'basket': {
      doc.triangle(cx - s * 0.5, cy - s * 0.15, cx + s * 0.5, cy - s * 0.15, cx + s * 0.32, cy + s * 0.5, 'F')
      doc.triangle(cx - s * 0.5, cy - s * 0.15, cx + s * 0.32, cy + s * 0.5, cx - s * 0.32, cy + s * 0.5, 'F')
      doc.setLineWidth(size * 0.07)
      doc.setDrawColor(bg)
      doc.line(cx - s * 0.32, cy - s * 0.15, cx + s * 0.32, cy - s * 0.15)
      doc.line(cx - s * 0.15, cy + s * 0.1, cx - s * 0.1, cy + s * 0.4)
      doc.line(cx + s * 0.15, cy + s * 0.1, cx + s * 0.1, cy + s * 0.4)
      break
    }
    case 'bed': {
      doc.roundedRect(cx - s * 0.55, cy - s * 0.05, s * 1.1, s * 0.5, 1.5, 1.5, 'F')
      doc.setFillColor(bg)
      doc.roundedRect(cx - s * 0.4, cy - s * 0.3, s * 0.42, s * 0.3, 1.2, 1.2, 'F')
      doc.setFillColor(255, 255, 255)
      doc.rect(cx - s * 0.55, cy - s * 0.38, s * 1.1, s * 0.14, 'F')
      break
    }
    case 'backpack': {
      doc.roundedRect(cx - s * 0.4, cy - s * 0.45, s * 0.8, s * 0.9, s * 0.3, s * 0.3, 'F')
      doc.setFillColor(bg)
      doc.roundedRect(cx - s * 0.18, cy - s * 0.25, s * 0.36, s * 0.24, 1, 1, 'F')
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(cx - s * 0.22, cy - s * 0.6, s * 0.44, s * 0.22, 1, 1, 'F')
      break
    }
    case 'book': {
      doc.triangle(cx - s * 0.48, cy - s * 0.4, cx - s * 0.48, cy + s * 0.42, cx, cy + s * 0.22, 'F')
      doc.triangle(cx, cy + s * 0.22, cx + s * 0.48, cy + s * 0.42, cx + s * 0.48, cy - s * 0.4, 'F')
      doc.setFillColor(bg)
      doc.triangle(cx - s * 0.42, cy - s * 0.33, cx - s * 0.42, cy + s * 0.32, cx - s * 0.02, cy + s * 0.16, 'F')
      break
    }
    case 'plate': {
      doc.circle(cx - s * 0.05, cy, s * 0.48, 'F')
      doc.setFillColor(bg)
      doc.circle(cx - s * 0.05, cy, s * 0.26, 'F')
      doc.setFillColor(255, 255, 255)
      doc.setLineWidth(size * 0.07)
      doc.line(cx + s * 0.48, cy - s * 0.42, cx + s * 0.48, cy + s * 0.42)
      break
    }
    case 'cup': {
      doc.roundedRect(cx - s * 0.28, cy - s * 0.42, s * 0.56, s * 0.82, s * 0.12, s * 0.12, 'F')
      doc.setLineWidth(size * 0.09)
      doc.line(cx + s * 0.3, cy - s * 0.1, cx + s * 0.5, cy - s * 0.1)
      doc.line(cx + s * 0.5, cy - s * 0.1, cx + s * 0.5, cy + s * 0.15)
      doc.line(cx + s * 0.5, cy + s * 0.15, cx + s * 0.3, cy + s * 0.15)
      break
    }
    case 'dish': {
      doc.ellipse(cx, cy + s * 0.15, s * 0.5, s * 0.22, 'F')
      doc.setFillColor(bg)
      doc.ellipse(cx, cy + s * 0.1, s * 0.3, s * 0.12, 'F')
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(cx - s * 0.08, cy - s * 0.55, s * 0.16, s * 0.55, s * 0.06, s * 0.06, 'F')
      break
    }
    case 'broom': {
      doc.setLineWidth(size * 0.1)
      doc.line(cx - s * 0.15, cy + s * 0.5, cx + s * 0.35, cy - s * 0.5)
      doc.triangle(cx - s * 0.5, cy + s * 0.35, cx - s * 0.1, cy + s * 0.55, cx - s * 0.2, cy + s * 0.05, 'F')
      break
    }
    case 'trash': {
      doc.triangle(cx - s * 0.35, cy - s * 0.35, cx + s * 0.35, cy - s * 0.35, cx + s * 0.4, cy - s * 0.48, 'F')
      doc.roundedRect(cx - s * 0.35, cy - s * 0.35, s * 0.7, s * 0.75, 1, 1, 'F')
      doc.setFillColor(bg)
      doc.setLineWidth(size * 0.05)
      doc.setDrawColor(bg)
      doc.line(cx - s * 0.12, cy - s * 0.15, cx - s * 0.12, cy + s * 0.25)
      doc.line(cx + s * 0.12, cy - s * 0.15, cx + s * 0.12, cy + s * 0.25)
      break
    }
    case 'plant': {
      doc.triangle(cx - s * 0.32, cy + s * 0.5, cx + s * 0.32, cy + s * 0.5, cx + s * 0.2, cy + s * 0.12, 'F')
      doc.triangle(cx - s * 0.32, cy + s * 0.5, cx + s * 0.2, cy + s * 0.12, cx - s * 0.2, cy + s * 0.12, 'F')
      doc.ellipse(cx - s * 0.16, cy - s * 0.1, s * 0.16, s * 0.28, 'F')
      doc.ellipse(cx + s * 0.16, cy - s * 0.15, s * 0.16, s * 0.3, 'F')
      doc.ellipse(cx, cy - s * 0.35, s * 0.14, s * 0.24, 'F')
      break
    }
    case 'garden': {
      doc.ellipse(cx - s * 0.14, cy - s * 0.05, s * 0.2, s * 0.4, 'F')
      doc.ellipse(cx + s * 0.14, cy + s * 0.05, s * 0.2, s * 0.4, 'F')
      doc.setLineWidth(size * 0.06)
      doc.line(cx, cy + s * 0.4, cx, cy + s * 0.5)
      break
    }
    case 'paw': {
      doc.circle(cx, cy + s * 0.12, s * 0.3, 'F')
      doc.circle(cx - s * 0.28, cy - s * 0.22, s * 0.15, 'F')
      doc.circle(cx + s * 0.28, cy - s * 0.22, s * 0.15, 'F')
      doc.circle(cx - s * 0.06, cy - s * 0.42, s * 0.13, 'F')
      doc.circle(cx + s * 0.06, cy - s * 0.42, s * 0.13, 'F')
      break
    }
    case 'chicken': {
      doc.ellipse(cx, cy + s * 0.1, s * 0.4, s * 0.35, 'F')
      doc.circle(cx + s * 0.2, cy - s * 0.28, s * 0.22, 'F')
      doc.setFillColor(bg)
      doc.triangle(cx + s * 0.38, cy - s * 0.28, cx + s * 0.55, cy - s * 0.22, cx + s * 0.38, cy - s * 0.16, 'F')
      break
    }
    case 'horse': {
      doc.ellipse(cx - s * 0.05, cy + s * 0.1, s * 0.42, s * 0.3, 'F')
      doc.roundedRect(cx + s * 0.15, cy - s * 0.55, s * 0.28, s * 0.5, s * 0.1, s * 0.1, 'F')
      break
    }
    case 'heart': {
      doc.circle(cx - s * 0.22, cy - s * 0.12, s * 0.28, 'F')
      doc.circle(cx + s * 0.22, cy - s * 0.12, s * 0.28, 'F')
      doc.triangle(cx - s * 0.48, cy - s * 0.02, cx + s * 0.48, cy - s * 0.02, cx, cy + s * 0.5, 'F')
      break
    }
    case 'star': {
      drawStar(doc, cx, cy, s * 0.55, s * 0.25)
      break
    }
    case 'clock': {
      doc.circle(cx, cy, s * 0.5, 'F')
      doc.setFillColor(bg)
      doc.circle(cx, cy, s * 0.4, 'F')
      doc.setFillColor(255, 255, 255)
      doc.setLineWidth(size * 0.07)
      doc.line(cx, cy, cx, cy - s * 0.28)
      doc.line(cx, cy, cx + s * 0.2, cy + s * 0.08)
      break
    }
    case 'ball': {
      doc.circle(cx, cy, s * 0.5, 'F')
      doc.setDrawColor(bg)
      doc.setLineWidth(size * 0.055)
      doc.line(cx, cy - s * 0.5, cx, cy + s * 0.5)
      doc.line(cx - s * 0.5, cy, cx + s * 0.5, cy)
      break
    }
    case 'music': {
      doc.circle(cx - s * 0.2, cy + s * 0.32, s * 0.18, 'F')
      doc.circle(cx + s * 0.3, cy + s * 0.22, s * 0.18, 'F')
      doc.setLineWidth(size * 0.08)
      doc.line(cx - s * 0.05, cy + s * 0.32, cx - s * 0.05, cy - s * 0.45)
      doc.line(cx + s * 0.45, cy + s * 0.22, cx + s * 0.45, cy - s * 0.35)
      doc.line(cx - s * 0.05, cy - s * 0.45, cx + s * 0.45, cy - s * 0.35)
      break
    }
    case 'house': {
      doc.triangle(cx, cy - s * 0.55, cx - s * 0.48, cy - s * 0.02, cx + s * 0.48, cy - s * 0.02, 'F')
      doc.rect(cx - s * 0.36, cy - s * 0.02, s * 0.72, s * 0.5, 'F')
      doc.setFillColor(bg)
      doc.roundedRect(cx - s * 0.12, cy + s * 0.14, s * 0.24, s * 0.34, 1, 1, 'F')
      break
    }
  }
  doc.setFillColor(0, 0, 0)
}

function drawStar(doc: jsPDF, cx: number, cy: number, outerR: number, innerR: number) {
  const points: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? outerR : innerR
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)])
  }
  const lines = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]])
  doc.lines(lines, points[0][0], points[0][1], [1, 1], 'F', true)
}

// ---------- Decorações de página (ilustrações leves, não fotográficas) ----------

export function drawSun(doc: jsPDF, cx: number, cy: number, r: number, color: string) {
  doc.setFillColor(color)
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i
    const x1 = cx + Math.cos(angle) * r * 1.15
    const y1 = cy + Math.sin(angle) * r * 1.15
    const x2 = cx + Math.cos(angle) * r * 1.55
    const y2 = cy + Math.sin(angle) * r * 1.55
    doc.setLineWidth(r * 0.16)
    doc.setDrawColor(color)
    doc.line(x1, y1, x2, y2)
  }
  doc.circle(cx, cy, r, 'F')
}

export function drawCloud(doc: jsPDF, cx: number, cy: number, r: number, color: string) {
  doc.setFillColor(color)
  doc.circle(cx - r * 0.55, cy + r * 0.1, r * 0.55, 'F')
  doc.circle(cx + r * 0.15, cy - r * 0.25, r * 0.7, 'F')
  doc.circle(cx + r * 0.75, cy + r * 0.1, r * 0.5, 'F')
  doc.roundedRect(cx - r * 1, cy, r * 1.8, r * 0.55, r * 0.25, r * 0.25, 'F')
}

export function drawMoonStars(doc: jsPDF, cx: number, cy: number, r: number, color: string) {
  doc.setFillColor(color)
  doc.circle(cx, cy, r, 'F')
  doc.setFillColor(255, 255, 255)
  doc.circle(cx + r * 0.45, cy - r * 0.25, r * 0.85, 'F')
  doc.setFillColor(color)
  drawStar(doc, cx - r * 1.3, cy - r * 0.6, r * 0.32, r * 0.14)
  drawStar(doc, cx - r * 0.5, cy + r * 1.1, r * 0.22, r * 0.1)
}

export function drawSparkle(doc: jsPDF, cx: number, cy: number, r: number, color: string) {
  doc.setFillColor(color)
  drawStar(doc, cx, cy, r, r * 0.35)
}
