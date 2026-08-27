import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-cloud px-6 py-10 text-center">
      <span className="pointer-events-none absolute left-8 top-10 text-2xl opacity-70">✨</span>
      <span className="pointer-events-none absolute right-10 top-24 text-xl opacity-60">☁️</span>
      <span className="pointer-events-none absolute bottom-40 left-10 text-xl opacity-50">⭐</span>

      <div />
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-primary text-4xl shadow-lg shadow-primary/30">
          🏠
          <span className="absolute -right-1.5 -top-1.5 text-lg">💜</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-snug text-ink">
            Crie rotinas que fazem
            <br />
            sentido para <span className="text-coral-dark">sua família</span>.
          </h1>
        </div>
        <p className="max-w-xs text-base leading-relaxed text-ink-soft">
          Organize os momentos do dia, as responsabilidades e as tarefas das crianças em materiais visuais
          personalizados.
        </p>
        <div className="flex gap-2 text-2xl">
          <span>🧸</span><span>📖</span><span>🪴</span><span>🐶</span><span>🎨</span>
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/cadastro')}
          className="w-full rounded-2xl bg-primary py-4 font-display text-lg font-bold text-white shadow-md shadow-primary/30 transition active:scale-[0.98]"
        >
          ✨ Criar minha rotina
        </button>
        <button type="button" onClick={() => navigate('/entrar')} className="text-sm font-bold text-ink-soft">
          Já tenho uma conta <span className="text-primary-dark">→ Entrar</span>
        </button>
      </div>
    </div>
  )
}
