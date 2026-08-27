import { jsPDF } from 'jspdf'
import { drawCloud, drawEmojiIcon, drawMoonStars, drawSparkle, drawSun, drawTaskIcon, pickTaskIconKey } from './pdfIcons'
import { resolveChildTask } from './resolveTask'
import type { Child, ChildTask, CustomTask, HowToCard, PeriodOfDay, Routine, TaskCategory, Weekday, WeeklyTaskItem } from '../types'
import { PERIODS, PERIOD_LABELS, WEEKDAYS, WEEKDAY_LABELS } from '../types'

// Geração de PDF real, desenhado a partir de dados estruturados com a API de
// desenho do jsPDF (texto, formas, imagens) — nunca uma captura de tela.
// Ver seções 46-71 e 81-82 do prompt mestre.

const PALETTE: Record<PeriodOfDay, { bg: string; text: string }> = {
  manha: { bg: '#FFD43B', text: '#5c4a00' },
  tarde: { bg: '#4DABF7', text: '#0a3d66' },
  noite: { bg: '#9775FA', text: '#2b1a66' },
}

function drawAvatar(doc: jsPDF, child: Child, x: number, y: number, size: number) {
  if (child.photo) {
    try {
      doc.addImage(child.photo, 'JPEG', x, y, size, size, undefined, 'FAST')
      return
    } catch {
      // segue para o fallback
    }
  }
  doc.setFillColor('#6C5CE7')
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(size * 2.4)
  doc.text((child.name || '?').charAt(0).toUpperCase(), x + size / 2, y + size / 2 + size * 0.18, { align: 'center' })
}

function roundedPanel(doc: jsPDF, x: number, y: number, w: number, h: number, color: string) {
  doc.setFillColor(color)
  doc.roundedRect(x, y, w, h, 3, 3, 'F')
}

// Ícone de uma tarefa: usa o emoji real já escolhido para ela (mesmo que aparece no
// app) como imagem; se esse emoji específico não tiver PNG extraído, cai para o
// desenho vetorial por categoria/palavra-chave.
function drawResolvedIcon(doc: jsPDF, emoji: string, name: string, category: TaskCategory, cx: number, cy: number, size: number, badgeColor: string) {
  const drew = drawEmojiIcon(doc, emoji, cx, cy, size, badgeColor)
  if (!drew) drawTaskIcon(doc, pickTaskIconKey(name, category), cx, cy, size, badgeColor)
}

export function generateRoutinePdf({
  child,
  day,
  routine,
  weeklyTasks,
  childTasks,
  customTasks,
}: {
  child: Child
  day: Weekday
  routine: Routine
  weeklyTasks: WeeklyTaskItem[]
  childTasks: Record<string, ChildTask>
  customTasks: Record<string, CustomTask>
}): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = 210
  const pageH = 297
  const marginX = 12
  const contentW = pageW - marginX * 2

  // Moldura da página
  doc.setDrawColor('#6C5CE7')
  doc.setLineWidth(1.6)
  doc.roundedRect(5, 5, pageW - 10, pageH - 10, 6, 6, 'S')

  // Cabeçalho
  roundedPanel(doc, marginX, 12, contentW, 32, '#EDE9FF')
  drawSparkle(doc, marginX + contentW - 10, 18, 3.2, '#FFD43B')
  drawSparkle(doc, marginX + contentW - 22, 38, 2.2, '#FF6B6B')
  drawSparkle(doc, marginX + contentW - 6, 32, 2, '#38D9A9')
  drawAvatar(doc, child, marginX + 6, 16, 24)
  doc.setTextColor('#2b2440')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Minha rotina', marginX + 36, 27)
  doc.setFontSize(16)
  doc.setTextColor('#4B3FC7')
  doc.text(`${child.name || ''}`.toUpperCase(), marginX + 36, 35)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor('#5c5470')
  const ageText = child.age ? `${child.age} anos` : ''
  doc.text([WEEKDAY_LABELS[day], ageText].filter(Boolean).join(' • '), marginX + 36, 41)

  // Colunas manhã / tarde / noite
  const colGap = 5
  const colW = (contentW - colGap * 2) / 3
  const colTop = 50
  const colMaxHeight = 155

  PERIODS.forEach((period, idx) => {
    const x = marginX + idx * (colW + colGap)
    const palette = PALETTE[period]
    roundedPanel(doc, x, colTop, colW, 13, palette.bg)
    if (period === 'manha') drawSun(doc, x + 9, colTop + 6.5, 3, '#FFFFFF')
    if (period === 'tarde') drawCloud(doc, x + 9, colTop + 6.5, 2.6, '#FFFFFF')
    if (period === 'noite') drawMoonStars(doc, x + 9, colTop + 6.5, 2.6, '#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(palette.text)
    doc.text(PERIOD_LABELS[period], x + 17, colTop + 8, { align: 'left' })

    const items = routine.periods[period]
    let y = colTop + 19

    if (items.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor('#a39cb5')
      doc.text('Nenhuma tarefa', x + colW / 2, y + 6, { align: 'center' })
      return
    }

    const rowH = Math.max(13, Math.min(19, (colMaxHeight - 5) / items.length))
    const iconSize = Math.min(10, rowH - 3)

    for (const item of items) {
      const childTask = childTasks[item.childTaskId]
      const resolved = childTask ? resolveChildTask(childTask, customTasks) : null
      if (!resolved) continue

      drawResolvedIcon(doc, resolved.icon, resolved.name, resolved.category, x + iconSize / 2 + 1, y + rowH / 2 - 2, iconSize, palette.bg)

      doc.setTextColor('#2b2440')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.8)
      const nameLines = doc.splitTextToSize(resolved.name, colW - iconSize - 14)
      doc.text(nameLines.slice(0, 2), x + iconSize + 4, y + rowH / 2 - 3.5)

      if (item.time) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor('#5c5470')
        doc.text(item.time, x + iconSize + 4, y + rowH / 2 + 3.5)
      }

      doc.setDrawColor(palette.text)
      doc.setLineWidth(0.5)
      doc.circle(x + colW - 4.5, y + rowH / 2, 2.6, 'S')

      doc.setDrawColor('#f0e6ff')
      doc.setLineWidth(0.2)
      doc.line(x + 1, y + rowH - 1, x + colW - 1, y + rowH - 1)

      y += rowH
    }
  })

  // Tarefas da semana
  const weekTop = colTop + colMaxHeight + 12
  roundedPanel(doc, marginX, weekTop, contentW, 8, '#38D9A9')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor('#0a4a3a')
  doc.text('Tarefas da semana', marginX + contentW / 2, weekTop + 5.5, { align: 'center' })

  const dayColGap = 2
  const dayColW = (contentW - dayColGap * 6) / 7
  const dayColTop = weekTop + 12

  WEEKDAYS.forEach((d, idx) => {
    const x = marginX + idx * (dayColW + dayColGap)
    doc.setFillColor(d === day ? '#FFE3E3' : '#F7F5FC')
    doc.roundedRect(x, dayColTop, dayColW, 42, 2, 2, 'F')
    if (d === day) drawSparkle(doc, x + dayColW - 3.5, dayColTop + 3.5, 1.8, '#FF6B6B')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor('#2b2440')
    doc.text(WEEKDAY_LABELS[d].slice(0, 3).toUpperCase(), x + dayColW / 2, dayColTop + 5.5, { align: 'center' })

    const dayTasks = weeklyTasks.filter((w) => w.day === d).sort((a, b) => a.order - b.order)
    let ty = dayColTop + 11
    for (const w of dayTasks.slice(0, 5)) {
      const childTask = childTasks[w.childTaskId]
      const resolved = childTask ? resolveChildTask(childTask, customTasks) : null
      if (!resolved) continue
      drawResolvedIcon(doc, resolved.icon, resolved.name, resolved.category, x + 4, ty, 5.2, '#38D9A9')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor('#5c5470')
      const lines = doc.splitTextToSize(resolved.name, dayColW - 9)
      doc.text(lines.slice(0, 2), x + 7.5, ty - 1.5)
      ty += 7.2
    }
    if (dayTasks.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(6.3)
      doc.setTextColor('#c9c2db')
      doc.text('—', x + dayColW / 2, ty, { align: 'center' })
    }

    doc.setDrawColor('#38D9A9')
    doc.setLineWidth(0.4)
    doc.circle(x + dayColW / 2 - 3.5, dayColTop + 37, 2.2, 'S')
    drawSparkle(doc, x + dayColW / 2 + 3.5, dayColTop + 37, 2, '#FFD43B')
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor('#c9c2db')
  doc.text(`Gerado pelo Afterschol • ${new Date().toLocaleDateString('pt-BR')}`, marginX, 291)

  return doc
}

export function generateHowToPdf({
  card,
  taskName,
  childName,
  category = 'outro',
  icon,
}: {
  card: HowToCard
  taskName: string
  childName: string
  category?: TaskCategory
  icon?: string
}): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = 210
  const pageH = 297
  const marginX = 16
  const contentW = pageW - marginX * 2

  doc.setDrawColor('#6C5CE7')
  doc.setLineWidth(1.6)
  doc.roundedRect(5, 5, pageW - 10, pageH - 10, 6, 6, 'S')

  roundedPanel(doc, marginX, 14, contentW, 26, '#EDE7FF')
  drawResolvedIcon(doc, icon ?? '', taskName, category, marginX + contentW - 16, 27, 15, '#6C5CE7')
  drawSparkle(doc, marginX + contentW - 30, 20, 2.4, '#FFD43B')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor('#7048e8')
  doc.text('COMO FAZER', marginX + 8, 24)
  doc.setFontSize(19)
  doc.setTextColor('#2b2440')
  doc.text(card.title || taskName, marginX + 8, 33, { maxWidth: contentW - 40 })

  let y = 52
  const steps = [...card.steps].sort((a, b) => a.order - b.order)

  steps.forEach((step, i) => {
    const boxH = 26
    if (y + boxH > 275) {
      doc.addPage()
      y = 20
    }
    roundedPanel(doc, marginX, y, contentW, boxH, i % 2 === 0 ? '#F7F6FC' : '#F3FBF8')
    doc.setFillColor('#6C5CE7')
    doc.circle(marginX + 12, y + boxH / 2, 7, 'F')
    doc.setTextColor('#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(String(i + 1), marginX + 12, y + boxH / 2 + 1.3, { align: 'center' })
    drawResolvedIcon(doc, icon ?? '', taskName, category, marginX + contentW - 13, y + boxH / 2, 13, i % 2 === 0 ? '#9C92F5' : '#38D9A9')

    doc.setTextColor('#2b2440')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(step.text, contentW - 46)
    doc.text(lines.slice(0, 3), marginX + 24, y + boxH / 2 - (Math.min(lines.length, 3) - 1) * 2.6 + 1.5)

    y += boxH + 6
  })

  if (steps.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(11)
    doc.setTextColor('#a39cb5')
    doc.text('Nenhum passo adicionado ainda.', marginX, y + 6)
  } else {
    drawSparkle(doc, marginX + 8, y + 4, 3, '#38D9A9')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor('#0a4a3a')
    doc.text('Pronto!', marginX + 16, y + 6)
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor('#c9c2db')
  doc.text(`Para ${childName} • Gerado pelo Afterschol`, marginX, 291)

  return doc
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
