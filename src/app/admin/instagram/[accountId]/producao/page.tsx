import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChecklistCell } from "@/components/admin/instagram/ChecklistCell";
import { ProgressBar, StatusBadge } from "@/components/admin/instagram/ui";
import { loadMatrix, themeLabel } from "@/lib/instagram-data";
import {
  STATUS_LABELS,
  STEPS,
  postProgress,
  postStatus,
  type PostStatus,
} from "@/lib/instagram";

const FILTERS: (PostStatus | "todos")[] = ["todos", "ideia", "producao", "pronto", "publicado"];

export default async function ProductionPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { accountId } = await params;
  const { status: statusParam } = await searchParams;
  const filter = FILTERS.find((item) => item === statusParam) ?? "todos";
  const { matrix, posts } = await loadMatrix(accountId);
  const base = `/admin/instagram/${accountId}`;

  const counts = Object.fromEntries(
    FILTERS.map((item) => [
      item,
      item === "todos" ? posts.length : posts.filter((post) => postStatus(post) === item).length,
    ]),
  ) as Record<PostStatus | "todos", number>;

  return (
    <div>
      <p className="text-ink/60 text-[14px] mb-5 max-w-2xl">
        Marque cada etapa conforme for concluindo — salva na hora. Etapas com “—” não se aplicam
        ao post (ative isca, ManyChat ou produto dentro do post, pelo título).
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((item) => (
          <Link
            key={item}
            href={item === "todos" ? `${base}/producao` : `${base}/producao?status=${item}`}
            className={`rounded-full px-4 py-1.5 text-[13px] border ${
              filter === item
                ? "bg-moss border-moss text-parchment"
                : "border-line text-ink/70 hover:border-moss"
            }`}
          >
            {item === "todos" ? "Todos" : STATUS_LABELS[item]} ({counts[item]})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border border-line rounded-sm bg-card">
        <table className="w-full min-w-[900px] text-[14px]">
          <thead>
            <tr className="bg-cream text-left text-[12px] uppercase tracking-[0.1em] text-ink/60">
              <th className="px-3 py-2 font-normal">Post</th>
              <th className="px-2 py-2 font-normal">Data</th>
              {STEPS.map((step) => (
                <th key={step.key} className="px-2 py-2 font-normal text-center" title={step.label}>
                  {step.short}
                </th>
              ))}
              <th className="px-3 py-2 font-normal w-32">Progresso</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((theme) => {
              const rows = theme.posts.filter(
                (post) => filter === "todos" || postStatus(post) === filter,
              );
              if (rows.length === 0) return null;
              return [
                <tr key={theme.id} className="border-t border-line">
                  <td
                    colSpan={STEPS.length + 3}
                    className="px-3 pt-4 pb-1 font-display italic text-[17px] text-moss-dark"
                  >
                    {theme.position}. {themeLabel(theme)}
                  </td>
                </tr>,
                ...rows.map((post) => {
                  const progress = postProgress(post);
                  return (
                    <tr key={post.id} className="border-t border-line/60 hover:bg-cream/50">
                      <td className="px-3 py-2 max-w-[260px]">
                        <Link
                          href={`${base}/posts/${post.id}`}
                          className="text-ink hover:text-moss line-clamp-2"
                        >
                          {post.title.trim() || (
                            <span className="text-ink/40 italic">
                              Post {theme.position}.{post.position} — sem título
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-ink/60 whitespace-nowrap">
                        {post.scheduled_date ? format(parseISO(post.scheduled_date), "dd/MM") : "—"}
                      </td>
                      {STEPS.map((step) => (
                        <td key={step.key} className="px-2 py-2 text-center">
                          {!step.appliesTo(post) ? (
                            <span className="text-ink/25">—</span>
                          ) : step.key === "title" ? (
                            <span className={step.isDone(post) ? "text-moss" : "text-ink/25"}>
                              {step.isDone(post) ? "✓" : "○"}
                            </span>
                          ) : (
                            <ChecklistCell
                              accountId={accountId}
                              postId={post.id}
                              field={step.key}
                              checked={step.isDone(post)}
                              label={step.label}
                            />
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <ProgressBar percent={progress.percent} />
                          <span className="text-[12px] text-ink/60 whitespace-nowrap">
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>

      {filter !== "todos" && counts[filter] === 0 ? (
        <p className="text-ink/60 mt-4">
          Nenhum post com status <StatusBadge status={filter} /> no momento.
        </p>
      ) : null}
    </div>
  );
}
