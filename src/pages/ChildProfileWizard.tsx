import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useToastStore } from '../store/useToastStore'
import { AppShell } from '../components/AppShell'
import { OnboardingStepper } from '../components/OnboardingStepper'
import type { AutonomyLevel } from '../types'
import { AUTONOMY_LABELS } from '../types'

const TOTAL_STEPS = 4

const INTEREST_OPTIONS = [
  { value: 'leitura', label: 'Leitura', emoji: '📖' },
  { value: 'desenho', label: 'Desenho', emoji: '🎨' },
  { value: 'musica', label: 'Música', emoji: '🎵' },
  { value: 'esportes', label: 'Esportes', emoji: '⚽' },
  { value: 'natureza', label: 'Natureza', emoji: '🌳' },
  { value: 'animais', label: 'Animais', emoji: '🐾' },
  { value: 'brincadeiras', label: 'Brincadeiras', emoji: '🧩' },
  { value: 'outros', label: 'Outros', emoji: '✨' },
]

export default function ChildProfileWizard() {
  const { childId, step } = useParams<{ childId: string; step: string }>()
  const navigate = useNavigate()
  const child = useAppStore((s) => (childId ? s.children[childId] : undefined))
  const updateChild = useAppStore((s) => s.updateChild)
  const show = useToastStore((s) => s.show)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentStep = Math.min(Math.max(Number(step) || 1, 1), TOTAL_STEPS)

  if (!child || !childId) return null

  function goToStep(n: number) {
    navigate(`/crianca/${childId}/perfil/${n}`)
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => updateChild(childId!, { photo: reader.result as string })
    reader.readAsDataURL(file)
  }

  function handleNext() {
    show('Perfil salvo.')
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1)
    } else {
      navigate(`/crianca/${childId}/responsabilidades`)
    }
  }

  function toggleInterest(value: string) {
    const has = child!.interests.includes(value)
    updateChild(childId!, { interests: has ? child!.interests.filter((i) => i !== value) : [...child!.interests, value] })
  }

  return (
    <AppShell onBack={() => (currentStep === 1 ? navigate('/familia') : goToStep(currentStep - 1))}>
      <OnboardingStepper current={3} />
      <div className="mx-auto flex max-w-sm flex-col gap-6 pt-2">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-ink">Vamos conhecer {child.name ? `o(a) ${child.name}` : 'sua criança'}? 💕</p>
          <p className="mt-1 text-sm text-ink-soft">Quanto mais soubermos, melhores serão as sugestões.</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentStep ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </div>

        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">Informações básicas para conhecer melhor.</p>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-lilac/20 text-4xl"
              >
                {child.photo ? <img src={child.photo} alt="" className="h-full w-full object-cover" /> : '📷'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <span className="text-xs font-semibold text-ink-soft">Adicionar foto (opcional)</span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Nome</span>
              <input className="input" value={child.name} onChange={(e) => updateChild(childId, { name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Idade</span>
              <input
                className="input"
                type="number"
                min={0}
                max={17}
                value={child.age ?? ''}
                onChange={(e) => updateChild(childId, { age: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Menino ou menina?</span>
              <div className="flex gap-2">
                {(['menino', 'menina', 'outro'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateChild(childId, { gender: g })}
                    className={`chip flex-1 justify-center ${child.gender === g ? 'chip-active' : ''}`}
                  >
                    {g === 'menino' ? '👦 Menino' : g === 'menina' ? '👧 Menina' : '🧒 Outro'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">Escola e horários do dia a dia.</p>
            <label className="flex items-center justify-between rounded-2xl border-2 border-line bg-white px-4 py-3.5">
              <span className="text-sm font-bold text-ink">Frequenta escola</span>
              <input
                type="checkbox"
                checked={child.school.attends}
                onChange={(e) => updateChild(childId, { school: { ...child.school, attends: e.target.checked } })}
                className="h-5 w-5 accent-primary"
              />
            </label>
            {child.school.attends && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-ink">Turno</span>
                  <div className="flex gap-2">
                    {(['manha', 'tarde', 'integral'] as const).map((shift) => (
                      <button
                        key={shift}
                        type="button"
                        onClick={() => updateChild(childId, { school: { ...child.school, shift } })}
                        className={`chip flex-1 justify-center ${child.school.shift === shift ? 'chip-active' : ''}`}
                      >
                        {shift === 'manha' ? 'Manhã' : shift === 'tarde' ? 'Tarde' : 'Integral'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className="text-sm font-bold text-ink">Entrada</span>
                    <input
                      className="input"
                      type="time"
                      value={child.school.entryTime ?? ''}
                      onChange={(e) => updateChild(childId, { school: { ...child.school, entryTime: e.target.value } })}
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className="text-sm font-bold text-ink">Saída</span>
                    <input
                      className="input"
                      type="time"
                      value={child.school.exitTime ?? ''}
                      onChange={(e) => updateChild(childId, { school: { ...child.school, exitTime: e.target.value } })}
                    />
                  </label>
                </div>
              </>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Atividades extracurriculares</span>
              <input
                className="input"
                placeholder="Ex: natação, balé (separe por vírgula)"
                value={child.extracurricular.join(', ')}
                onChange={(e) =>
                  updateChild(childId, {
                    extracurricular: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Acorda</span>
                <input className="input" type="time" value={child.wakeTime ?? ''} onChange={(e) => updateChild(childId, { wakeTime: e.target.value })} />
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-sm font-bold text-ink">Dorme</span>
                <input className="input" type="time" value={child.sleepTime ?? ''} onChange={(e) => updateChild(childId, { sleepTime: e.target.value })} />
              </label>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">O que ela gosta de fazer?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleInterest(opt.value)}
                  className={`chip ${child.interests.includes(opt.value) ? 'chip-active' : ''}`}
                >
                  <span>{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Outras características (opcional)</span>
              <textarea
                className="input min-h-24 resize-none"
                placeholder="Ex: gosta de rotina bem visual, se distrai fácil, adora animais..."
                value={child.characteristics}
                onChange={(e) => updateChild(childId, { characteristics: e.target.value })}
              />
            </label>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-soft">Como está a autonomia dela hoje? Isso é só um ponto de partida — pode mudar quando quiser.</p>
            <div className="flex flex-col gap-3">
              {(Object.keys(AUTONOMY_LABELS) as AutonomyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateChild(childId, { autonomyLevel: level })}
                  className={`card flex items-center gap-3 border-2 p-4 text-left transition ${
                    child.autonomyLevel === level ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <span className="text-2xl">{level === 'ajuda' ? '🤝' : level === 'desenvolvendo' ? '🌱' : '🌟'}</span>
                  <span className="font-semibold text-ink">{AUTONOMY_LABELS[level]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleNext}
          className="rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-md shadow-primary/30 transition active:scale-[0.98]"
        >
          {currentStep < TOTAL_STEPS ? 'Continuar' : 'Ver sugestões de responsabilidades'}
        </button>
      </div>
    </AppShell>
  )
}
