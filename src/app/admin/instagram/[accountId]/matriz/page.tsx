import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, STATUS_DOT, StatusLegend, inputClass } from "@/components/admin/instagram/ui";
import { loadMatrix } from "@/lib/instagram-data";
import { STATUS_LABELS, postStatus } from "@/lib/instagram";
import { saveMatrixRowAction } from "../../actions";

export default async function MatrixPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { accountId } = await params;
  const { error: saveError } = await searchParams;
  const { matrix, posts } = await loadMatrix(accountId);

  const themesNamed = matrix.filter((theme) => theme.name.trim()).length;
  const titled = posts.filter((post) => post.title.trim()).length;

  return (
    <div>
      <ErrorNotice message={saveError} />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-ink/60 text-[14px] max-w-xl">
          Escreva os 6 temas e os 5 títulos de cada um. Clique em <strong>Salvar linha</strong> em
          cada tema. Para marcar isca, ManyChat, produto e métricas, abra o post pelo ↗.
        </p>
        <div className="flex gap-6 text-[14px] text-ink/70">
          <span>
            <strong className="text-ink text-[20px] font-display">{themesNamed}</strong> / {matrix.length} temas
          </span>
          <span>
            <strong className="text-ink text-[20px] font-display">{titled}</strong> / {posts.length} títulos
          </span>
        </div>
      </div>

      <StatusLegend />

      <div className="flex flex-col gap-4">
        {matrix.map((theme) => (
          <Card key={theme.id} className="!p-5">
            <form action={saveMatrixRowAction} className="flex flex-col gap-3">
              <input type="hidden" name="accountId" value={accountId} />
              <input type="hidden" name="themeId" value={theme.id} />

              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display italic text-[22px] text-gold w-8">{theme.position}</span>
                <input
                  type="text"
                  name="themeName"
                  defaultValue={theme.name}
                  placeholder={`Tema ${theme.position}`}
                  aria-label={`Nome do tema ${theme.position}`}
                  className={`${inputClass} flex-1 min-w-[200px] font-semibold`}
                />
                <Button type="submit" variant="secondary" className="!px-4 !py-1.5 !text-[13px]">
                  Salvar linha
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {theme.posts.map((post) => {
                  const status = postStatus(post);
                  return (
                    <div key={post.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[12px] text-ink/50">
                        <span className="flex items-center gap-1.5" title={STATUS_LABELS[status]}>
                          <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                          Post {theme.position}.{post.position}
                        </span>
                        <Link
                          href={`/admin/instagram/${accountId}/posts/${post.id}`}
                          className="hover:text-moss"
                          title="Abrir post"
                        >
                          ↗
                        </Link>
                      </div>
                      <input type="hidden" name="postId" value={post.id} />
                      <textarea
                        name="title"
                        rows={2}
                        defaultValue={post.title}
                        placeholder="Título do post"
                        className={`${inputClass} text-[14px] resize-none`}
                      />
                    </div>
                  );
                })}
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
