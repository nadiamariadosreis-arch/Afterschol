import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { AppShell } from '../components/AppShell'

export default function LogIn() {
  const navigate = useNavigate()
  const logIn = useAppStore((s) => s.logIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await logIn(email.trim(), password)
    setLoading(false)
    if (!result.ok) return setError(result.error ?? 'Não foi possível entrar.')
    navigate('/painel')
  }

  return (
    <AppShell title="Entrar" onBack={() => navigate('/')}>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 pt-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">E-mail</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Senha</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>

        {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-md shadow-primary/30 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AppShell>
  )
}
