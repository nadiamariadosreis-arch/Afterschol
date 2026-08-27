import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell, BottomNav } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { slugify } from '../lib/pdfGenerator'

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(',')
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'application/pdf'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

export default function RoutinePdfGenerated() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const pdfs = useAppStore((s) => s.pdfs)
  const show = useToastStore((s) => s.show)

  const latestPdf = useMemo(() => {
    return Object.values(pdfs)
      .filter((p) => p.childId === childId && p.type === 'rotina')
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
  }, [pdfs, childId])

  if (!child || !childId) return null

  const filename = `Rotina-${slugify(child.name || 'crianca')}.pdf`

  function handleDownload() {
    if (!latestPdf?.fileDataUrl) return
    const a = document.createElement('a')
    a.href = latestPdf.fileDataUrl
    a.download = filename
    a.click()
    show('PDF baixado.')
  }

  function handlePrint() {
    if (!latestPdf?.fileDataUrl) return
    const win = window.open(latestPdf.fileDataUrl, '_blank')
    if (!win) {
      handleDownload()
      return
    }
    win.addEventListener('load', () => {
      try {
        win.print()
      } catch {
        // navegador não permite — a mãe pode imprimir pela própria aba
      }
    })
  }

  async function handleShare() {
    if (!latestPdf?.fileDataUrl) return
    try {
      const file = dataUrlToFile(latestPdf.fileDataUrl, filename)
      const navAny = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }
      if (navAny.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
    } catch {
      // segue para o download
    }
    handleDownload()
    show('Seu navegador não suporta compartilhamento direto — baixamos o PDF para você compartilhar manualmente.')
  }

  if (!latestPdf) {
    return (
      <AppShell title="PDF da rotina" onBack={() => navigate(`/crianca/${childId}/rotina`)}>
        <div className="pt-6">
          <EmptyState
            emoji="📄"
            title="Nenhum PDF gerado ainda"
            description="Volte para a prévia da rotina e gere o primeiro PDF."
            action={
              <button
                type="button"
                onClick={() => navigate(`/crianca/${childId}/rotina/preview`)}
                className="mt-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white"
              >
                Ir para a prévia
              </button>
            }
          />
        </div>
        <BottomNav childId={childId} />
      </AppShell>
    )
  }

  return (
    <AppShell title="PDF gerado" onBack={() => navigate(`/crianca/${childId}/rotina/preview`)}>
      <div className="flex flex-col gap-4 pt-2">
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <span className="text-4xl">🎉</span>
          <p className="font-display text-lg font-bold text-ink">Seu PDF está pronto!</p>
          <p className="text-sm text-ink-soft">A rotina de {child.name} foi salva na biblioteca da família.</p>
        </div>

        <div className="card overflow-hidden">
          <object data={latestPdf.fileDataUrl ?? ''} type="application/pdf" className="h-96 w-full">
            <p className="p-4 text-center text-sm text-ink-soft">Prévia não disponível neste navegador.</p>
          </object>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ActionButton emoji="⬇️" label="Baixar PDF" onClick={handleDownload} />
          <ActionButton emoji="🖨️" label="Imprimir" onClick={handlePrint} />
          <ActionButton emoji="📤" label="Compartilhar" onClick={handleShare} />
          <ActionButton emoji="🔄" label="Gerar novamente" onClick={() => navigate(`/crianca/${childId}/rotina/preview`)} />
        </div>

        <button
          type="button"
          onClick={() => navigate(`/crianca/${childId}/rotina`)}
          className="rounded-2xl border-2 border-line bg-white py-3.5 font-display text-sm font-bold text-ink-soft active:scale-95"
        >
          Voltar para editar
        </button>
      </div>
      <BottomNav childId={childId} />
    </AppShell>
  )
}

function ActionButton({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="card flex flex-col items-center gap-1 py-4 text-sm font-bold text-ink active:scale-95">
      <span className="text-2xl">{emoji}</span>
      {label}
    </button>
  )
}
