import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { AppShell } from '../components/AppShell'
import { OnboardingStepper } from '../components/OnboardingStepper'
import { EmptyState } from '../components/EmptyState'
import { Plus } from '../components/icons'
import type { Environment, FamilyFeature } from '../types'

const ENVIRONMENT_OPTIONS: { value: Environment; label: string; emoji: string }[] = [
  { value: 'apartamento', label: 'Apartamento', emoji: '🏢' },
  { value: 'casa', label: 'Casa', emoji: '🏡' },
  { value: 'condominio', label: 'Condomínio', emoji: '🏘️' },
  { value: 'area_rural', label: 'Área rural', emoji: '🌾' },
  { value: 'outro', label: 'Outro', emoji: '📍' },
]

const FEATURE_OPTIONS: { value: FamilyFeature; label: string; emoji: string }[] = [
  { value: 'animais', label: 'Animais de estimação', emoji: '🐾' },
  { value: 'jardim', label: 'Jardim', emoji: '🌷' },
  { value: 'horta', label: 'Horta', emoji: '🥕' },
  { value: 'area_externa', label: 'Área externa', emoji: '🌳' },
  { value: 'piscina', label: 'Piscina', emoji: '🏊' },
  { value: 'irmaos', label: 'Irmãos que dividem tarefas', emoji: '👫' },
]

function FamilyContextCard() {
  const currentUserId = useAppStore((s) => s.currentUserId)
  const user = useAppStore((s) => (currentUserId ? s.users[currentUserId] : null))
  const family = useAppStore((s) => (user?.familyId ? s.families[user.familyId] : null))
  const updateFamily = useAppStore((s) => s.updateFamily)

  if (!family) return null

  function toggleFeature(feature: FamilyFeature) {
    const has = family!.features.includes(feature)
    updateFamily({ features: has ? family!.features.filter((f) => f !== feature) : [...family!.features, feature] })
  }

  return (
    <div className="card p-4">
      <p className="font-display text-sm font-bold text-ink-soft">Sobre nossa casa (opcional)</p>
      <p className="mb-3 text-xs text-ink-soft/80">
        Isso nos ajuda a sugerir responsabilidades que combinam com a rotina da família.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {ENVIRONMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFamily({ environment: opt.value })}
            className={`chip ${family.environment === opt.value ? 'chip-active' : ''}`}
          >
            <span>{opt.emoji}</span> {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {FEATURE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleFeature(opt.value)}
            className={`chip ${family.features.includes(opt.value) ? 'chip-active' : ''}`}
          >
            <span>{opt.emoji}</span> {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Family() {
  const navigate = useNavigate()
  const currentUserId = useAppStore((s) => s.currentUserId)
  const user = useAppStore((s) => (currentUserId ? s.users[currentUserId] : null))
  const family = useAppStore((s) => (user?.familyId ? s.families[user.familyId] : null))
  const children = useAppStore((s) => s.children)
  const addChild = useAppStore((s) => s.addChild)
  const setActiveChild = useAppStore((s) => s.setActiveChild)

  const childList = (family?.childrenIds ?? []).map((id) => children[id]).filter(Boolean)

  function handleAddChild() {
    const id = addChild({})
    navigate(`/crianca/${id}/perfil/1`)
  }

  function openChild(id: string) {
    setActiveChild(id)
    navigate(`/crianca/${id}/perfil/1`)
  }

  return (
    <AppShell>
      <OnboardingStepper current={2} />
      <div className="mx-auto flex max-w-sm flex-col gap-5 pt-2">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-ink">Quem faz parte da sua família? 💕</p>
          <p className="mt-1 text-sm text-ink-soft">Adicione você e cada criança que terá rotinas personalizadas.</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="card flex items-center gap-3 p-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sunshine/40 text-xl">👩</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-ink">{user?.name} (você)</p>
              <p className="text-xs text-ink-soft">Responsável pela família</p>
            </div>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-xs text-white">✓</span>
          </div>

          {childList.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => openChild(child.id)}
              className="card flex items-center gap-3 p-3.5 text-left active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-lilac/20 text-xl">
                {child.photo ? (
                  <img src={child.photo} alt={child.name} className="h-11 w-11 object-cover" />
                ) : child.gender === 'menino' ? (
                  '👦'
                ) : child.gender === 'menina' ? (
                  '👧'
                ) : (
                  '🧒'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-ink">{child.name || 'Sem nome'}</p>
                <p className="text-xs text-ink-soft">{child.age ? `${child.age} anos` : 'Perfil incompleto'}</p>
              </div>
              {child.gender && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary-dark">
                  {child.gender === 'menino' ? 'Menino' : child.gender === 'menina' ? 'Menina' : ''}
                </span>
              )}
              <span className="text-ink-soft/60">✏️</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleAddChild}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary/5 py-3.5 text-sm font-bold text-primary-dark active:scale-[0.99]"
          >
            <Plus /> Adicionar criança
          </button>
        </div>

        {childList.length === 0 && (
          <EmptyState emoji="🧒" title="Ainda não há crianças cadastradas" description="Cadastre a primeira criança para começar a montar a rotina dela." />
        )}

        <FamilyContextCard />

        {childList.length > 0 ? (
          <button
            type="button"
            onClick={() => navigate('/painel')}
            className="rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-md shadow-primary/30 active:scale-[0.98]"
          >
            Continuar →
          </button>
        ) : (
          <button type="button" onClick={() => navigate('/painel')} className="text-center text-sm font-bold text-ink-soft">
            Pular por enquanto
          </button>
        )}
      </div>
    </AppShell>
  )
}
