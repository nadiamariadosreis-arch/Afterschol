import { useState, type FormEvent, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { useLocalStorage } from "../lib/storage";
import { CODIGO_ACESSO } from "../lib/accessCode";

export default function AccessGate({ children }: { children: ReactNode }) {
  const [liberado, setLiberado] = useLocalStorage<boolean>("acesso-liberado", false);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(false);

  if (liberado) return <>{children}</>;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (codigo.trim().toLowerCase() === CODIGO_ACESSO.toLowerCase()) {
      setLiberado(true);
    } else {
      setErro(true);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/80 p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta text-cream">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-serif text-2xl text-ink">Casa em Ordem</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Digite o código de acesso que você recebeu na compra do método.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setErro(false);
            }}
            placeholder="Código de acesso"
            autoFocus
            className={`rounded-xl border bg-white px-4 py-3 text-center text-ink placeholder:text-ink-soft/60 focus:outline-none ${
              erro ? "border-clay" : "border-ink/15 focus:border-terracotta"
            }`}
          />
          {erro && <p className="text-sm text-clay">Código incorreto. Confira o e-mail da compra.</p>}
          <button
            type="submit"
            className="rounded-xl bg-terracotta px-4 py-3 font-semibold text-white hover:bg-terracotta-dark"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
