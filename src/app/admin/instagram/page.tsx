import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ErrorNotice, inputClass } from "@/components/admin/instagram/ui";
import { postStatus } from "@/lib/instagram";
import { createAccountAction, deleteAccountAction, updateAccountAction } from "./actions";

export default async function InstagramAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: saveError } = await searchParams;
  const supabase = await createClient();
  const [{ data: accounts }, { data: posts }] = await Promise.all([
    supabase.from("ig_accounts").select("*").order("sort_order").order("created_at"),
    supabase.from("ig_posts").select("*"),
  ]);

  return (
    <div>
      <SectionHeading eyebrow="Painel do Instagram" title="Meus perfis" />
      <ErrorNotice message={saveError} />

      <p className="text-ink/60 text-[14px] mb-6">
        Cada perfil tem a sua própria linguagem e a sua própria matriz de conteúdo
        (6 temas × 5 posts). Escolha um perfil para abrir a matriz, o calendário,
        o checklist de produção e os resultados.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {(accounts ?? []).map((account) => {
          const accountPosts = (posts ?? []).filter((post) => post.account_id === account.id);
          const published = accountPosts.filter((post) => postStatus(post) === "publicado").length;
          const titled = accountPosts.filter((post) => post.title.trim()).length;

          return (
            <Card key={account.id} className="flex flex-col gap-4">
              <div>
                <div className="text-[13px] tracking-[0.15em] uppercase text-moss">
                  @{account.handle}
                </div>
                <h3 className="font-display italic font-semibold text-[26px] text-ink">
                  {account.name}
                </h3>
                {account.voice ? (
                  <p className="text-ink/70 text-[14px] mt-1">Linguagem: {account.voice}</p>
                ) : null}
              </div>

              <div className="flex gap-6 text-[14px] text-ink/70">
                <span>
                  <strong className="text-ink">{titled}</strong> / {accountPosts.length} títulos
                </span>
                <span>
                  <strong className="text-ink">{published}</strong> publicados
                </span>
              </div>

              <Link
                href={`/admin/instagram/${account.id}/matriz`}
                className="self-start inline-flex items-center rounded-sm px-5 py-2 bg-moss text-parchment hover:bg-moss-dark text-[15px]"
              >
                Abrir painel →
              </Link>

              <details className="text-[14px]">
                <summary className="cursor-pointer text-ink/60 hover:text-moss">
                  Editar perfil
                </summary>
                <form action={updateAccountAction} className="flex flex-col gap-3 mt-4">
                  <input type="hidden" name="accountId" value={account.id} />
                  <AccountFields
                    defaults={{
                      handle: account.handle,
                      name: account.name,
                      voice: account.voice ?? "",
                      description: account.description ?? "",
                    }}
                  />
                  <label className="flex flex-col gap-1">
                    <span className="text-ink/70">Ordem</span>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={account.sort_order}
                      className={`${inputClass} w-24`}
                    />
                  </label>
                  <Button type="submit" variant="secondary" className="self-start !px-4 !py-1.5 !text-[13px]">
                    Salvar perfil
                  </Button>
                </form>
                <form action={deleteAccountAction} className="mt-4">
                  <input type="hidden" name="accountId" value={account.id} />
                  <button
                    type="submit"
                    className="text-[12px] text-terracotta underline underline-offset-2"
                  >
                    Remover perfil (apaga a matriz e as métricas dele)
                  </button>
                </form>
              </details>
            </Card>
          );
        })}

        {(accounts ?? []).length === 0 ? (
          <p className="text-ink/60">Nenhum perfil cadastrado ainda. Comece pelo formulário abaixo.</p>
        ) : null}
      </div>

      <Card>
        <h3 className="font-heading font-semibold text-[20px] text-ink mb-4">Cadastrar perfil</h3>
        <form action={createAccountAction} className="flex flex-col gap-3 max-w-xl text-[14px]">
          <AccountFields defaults={{ handle: "", name: "", voice: "", description: "" }} />
          <Button type="submit" variant="primary" className="self-start">
            Cadastrar e criar matriz 6×5
          </Button>
        </form>
      </Card>
    </div>
  );
}

function AccountFields({
  defaults,
}: {
  defaults: { handle: string; name: string; voice: string; description: string };
}) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-ink/70">@ do Instagram</span>
        <input
          type="text"
          name="handle"
          required
          defaultValue={defaults.handle}
          placeholder="ex: catequeseemacao"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink/70">Nome do perfil</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaults.name}
          placeholder="ex: Catequese em Ação"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink/70">Linguagem</span>
        <input
          type="text"
          name="voice"
          defaultValue={defaults.voice}
          placeholder="ex: acolhedora, para catequistas iniciantes"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-ink/70">Observações (público, objetivo, produtos…)</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={defaults.description}
          className={inputClass}
        />
      </label>
    </>
  );
}
