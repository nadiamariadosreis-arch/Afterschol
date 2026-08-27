import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { AppShell } from '../components/AppShell'
import { OnboardingStepper } from '../components/OnboardingStepper'

export default function SignUp() {
  const navigate = useNavigate()
  const signUp = useAppStore((s) => s.signUp)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Conte seu nome para a gente te chamar certinho.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Digite um e-mail válido.')
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')

    setLoading(true)
    const result = await signUp(name.trim(), email.trim(), password)
    setLoading(false)
    if (!result.ok) return setError(result.error ?? 'Não foi possível criar sua conta.')
    navigate('/familia')
  }

  return (
    <AppShell onBack={() => navigate('/')}>
      <OnboardingStepper current={1} />
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-4 pt-2">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-ink">Vamos começar? 💜</p>
          <p className="mt-1 text-sm text-ink-soft">Para criar rotinas incríveis para sua família, precisamos de algumas informações suas.</p>
        </div>

        <Field label="Seu nome">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como podemos te chamar?"
            autoComplete="name"
          />
        </Field>
        <Field label="E-mail">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Senha">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Pelo menos 6 caracteres"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar senha">
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
          />
        </Field>

        {error && <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark">{error}</p>}

        <div className="flex items-center gap-2 rounded-2xl bg-mint/10 px-3 py-2.5 text-xs font-semibold text-ink-soft">
          🔒 Seus dados estão seguros com a gente. Nunca compartilhamos suas informações.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-2xl bg-primary py-4 font-display text-base font-bold text-white shadow-md shadow-primary/30 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Criando conta...' : 'Continuar →'}
        </button>
      </form>
    </AppShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-bold text-ink">{label}</span>
      {children}
    </label>
  )
}
