import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/Card";
import { loadMatrix, themeLabel } from "@/lib/instagram-data";
import { formatCurrency, formatNumber, percent } from "@/lib/instagram";
import type { IgPost } from "@/lib/supabase/types";

type MetricKey = "reach" | "likes" | "comments" | "saves" | "shares" | "new_followers" | "mc_messages_sent" | "sales";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "saves", label: "Salvamentos" },
  { key: "likes", label: "Curtidas" },
  { key: "reach", label: "Alcance" },
  { key: "new_followers", label: "Novos seguidores" },
  { key: "shares", label: "Compartilhamentos" },
  { key: "comments", label: "Comentários" },
  { key: "mc_messages_sent", label: "Mensagens ManyChat" },
  { key: "sales", label: "Vendas" },
];

function sum(posts: IgPost[], key: keyof IgPost) {
  return posts.reduce((total, post) => total + (Number(post[key]) || 0), 0);
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ metrica?: string }>;
}) {
  const { accountId } = await params;
  const { metrica } = await searchParams;
  const metric = METRICS.find((item) => item.key === metrica) ?? METRICS[0];
  const { matrix, posts, themeById } = await loadMatrix(accountId);
  const base = `/admin/instagram/${accountId}`;

  const published = posts
    .filter((post) => post.published)
    .sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""));

  if (published.length === 0) {
    return (
      <Card>
        <p className="text-ink/70">
          Ainda não há posts publicados. Quando você marcar um post como <strong>Publicado</strong> e
          preencher as métricas dele, os gráficos aparecem aqui.
        </p>
        <Link href={`${base}/producao`} className="inline-block mt-4 text-moss hover:underline">
          Ir para a produção →
        </Link>
      </Card>
    );
  }

  const reach = sum(published, "reach");
  const interactions =
    sum(published, "likes") + sum(published, "comments") + sum(published, "saves") + sum(published, "shares");

  const kpis = [
    { label: "Posts publicados", value: formatNumber(published.length), sub: `de ${posts.length} na matriz` },
    { label: "Alcance", value: formatNumber(reach) },
    { label: "Curtidas", value: formatNumber(sum(published, "likes")) },
    { label: "Salvamentos", value: formatNumber(sum(published, "saves")) },
    { label: "Compartilhamentos", value: formatNumber(sum(published, "shares")) },
    { label: "Comentários", value: formatNumber(sum(published, "comments")) },
    { label: "Novos seguidores", value: formatNumber(sum(published, "new_followers")) },
    { label: "Engajamento", value: percent(interactions, reach), sub: "interações ÷ alcance" },
  ];

  const funnel = [
    { label: "Receberam a mensagem", value: sum(published, "mc_messages_sent") },
    { label: "Clicaram no link", value: sum(published, "mc_link_clicks") },
    { label: "Viraram leads", value: sum(published, "mc_leads") },
    { label: "Compraram", value: sum(published, "sales") },
  ];

  const byTheme = matrix.map((theme) => ({
    label: `${theme.position}. ${themeLabel(theme)}`,
    value: sum(theme.posts.filter((post) => post.published), metric.key),
    count: theme.posts.filter((post) => post.published).length,
  }));

  const ranking = [...published]
    .sort((a, b) => (Number(b[metric.key]) || 0) - (Number(a[metric.key]) || 0))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Instagram</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <StatTile key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>ManyChat e vendas</SectionTitle>
        <div className="grid md:grid-cols-[2fr_1fr] gap-4">
          <Card className="!p-6">
            <h4 className="text-[14px] text-ink/70 mb-4">Funil das automações</h4>
            <div className="flex flex-col gap-3">
              {funnel.map((step, index) => (
                <div key={step.label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-ink">{step.label}</span>
                    <span className="text-ink/70">
                      <strong className="text-ink">{formatNumber(step.value)}</strong>
                      {index > 0 ? ` · ${percent(step.value, funnel[index - 1].value)} da etapa anterior` : ""}
                    </span>
                  </div>
                  <Bar value={step.value} max={funnel[0].value} title={`${step.label}: ${formatNumber(step.value)}`} />
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <StatTile label="Faturamento" value={formatCurrency(sum(published, "revenue_cents"))} />
            <StatTile
              label="Conversão total"
              value={percent(funnel[3].value, funnel[0].value)}
              sub="vendas ÷ mensagens"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-3">
          <SectionTitle className="!mb-0">Comparar por</SectionTitle>
          <div className="flex gap-2 flex-wrap">
            {METRICS.map((item) => (
              <Link
                key={item.key}
                href={`${base}/resultados?metrica=${item.key}`}
                scroll={false}
                className={`rounded-full px-3 py-1 text-[13px] border ${
                  item.key === metric.key
                    ? "bg-moss border-moss text-parchment"
                    : "border-line text-ink/70 hover:border-moss"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="!p-6">
            <h4 className="text-[14px] text-ink/70 mb-4">{metric.label} por tema</h4>
            <div className="flex flex-col gap-3">
              {byTheme.map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-[13px] mb-1 gap-2">
                    <span className="text-ink truncate">{row.label}</span>
                    <span className="text-ink whitespace-nowrap">
                      <strong>{formatNumber(row.value)}</strong>
                      <span className="text-ink/50"> · {row.count} posts</span>
                    </span>
                  </div>
                  <Bar
                    value={row.value}
                    max={Math.max(...byTheme.map((item) => item.value))}
                    title={`${row.label}: ${formatNumber(row.value)} ${metric.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="!p-6">
            <h4 className="text-[14px] text-ink/70 mb-4">{metric.label} post a post (ordem de publicação)</h4>
            <Columns posts={published} metric={metric} />
          </Card>
        </div>
      </section>

      <section>
        <SectionTitle>Top 10 por {metric.label.toLowerCase()}</SectionTitle>
        <div className="overflow-x-auto border border-line rounded-sm bg-card">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="bg-cream text-left text-[11px] uppercase tracking-[0.1em] text-ink/60">
                <th className="px-3 py-2 font-normal">Post</th>
                <th className="px-2 py-2 font-normal">Publicado</th>
                <th className="px-2 py-2 font-normal text-right">Alcance</th>
                <th className="px-2 py-2 font-normal text-right">Curtidas</th>
                <th className="px-2 py-2 font-normal text-right">Salv.</th>
                <th className="px-2 py-2 font-normal text-right">Compart.</th>
                <th className="px-2 py-2 font-normal text-right">Seguid.</th>
                <th className="px-2 py-2 font-normal text-right">Msgs MC</th>
                <th className="px-2 py-2 font-normal text-right">Cliques</th>
                <th className="px-3 py-2 font-normal text-right">Vendas</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((post) => {
                const theme = themeById.get(post.theme_id);
                return (
                  <tr key={post.id} className="border-t border-line/60">
                    <td className="px-3 py-2 max-w-[240px]">
                      <Link href={`${base}/posts/${post.id}`} className="text-ink hover:text-moss line-clamp-1">
                        {post.title || "Sem título"}
                      </Link>
                      <div className="text-[11px] text-ink/50 truncate">{themeLabel(theme)}</div>
                    </td>
                    <td className="px-2 py-2 text-ink/60 whitespace-nowrap">
                      {post.published_at ? format(parseISO(post.published_at), "dd/MM/yy") : "—"}
                    </td>
                    {(
                      ["reach", "likes", "saves", "shares", "new_followers", "mc_messages_sent", "mc_link_clicks", "sales"] as const
                    ).map((key) => (
                      <td
                        key={key}
                        className={`px-2 py-2 text-right tabular-nums ${key === metric.key ? "font-semibold text-ink" : "text-ink/70"}`}
                      >
                        {post[key] == null ? "—" : formatNumber(post[key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`font-body text-[13px] tracking-[0.28em] uppercase text-moss mb-3 ${className}`}>
      {children}
    </h3>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="!p-5">
      <div className="text-[12px] tracking-[0.12em] uppercase text-ink/60 mb-1">{label}</div>
      <p className="font-display text-[30px] leading-tight text-ink tabular-nums">{value}</p>
      {sub ? <p className="text-[12px] text-ink/50 mt-1">{sub}</p> : null}
    </Card>
  );
}

function Bar({ value, max, title }: { value: number; max: number; title: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0;
  return (
    <div className="h-3 w-full bg-parchment-dark/70 rounded-r-[4px]" title={title}>
      <div className="h-full bg-moss rounded-r-[4px] transition-[width]" style={{ width: `${width}%` }} />
    </div>
  );
}

function Columns({ posts, metric }: { posts: IgPost[]; metric: { key: MetricKey; label: string } }) {
  const values = posts.map((post) => Number(post[metric.key]) || 0);
  const max = Math.max(...values, 0);
  const best = values.indexOf(max);

  return (
    <div>
      <div className="flex items-end gap-[2px] h-48 border-b border-line">
        {posts.map((post, index) => {
          const value = values[index];
          const height = max > 0 ? (value / max) * 100 : 0;
          return (
            <div
              key={post.id}
              className="group relative flex-1 h-full flex items-end hover:bg-cream/70"
              title={`${post.title || "Sem título"} — ${formatNumber(value)} ${metric.label.toLowerCase()}`}
            >
              {index === best && max > 0 ? (
                <span className="absolute left-1/2 -translate-x-1/2 text-[11px] text-ink whitespace-nowrap" style={{ bottom: `calc(${height}% + 2px)` }}>
                  {formatNumber(value)}
                </span>
              ) : null}
              <div
                className="w-full bg-moss group-hover:bg-moss-dark rounded-t-[4px]"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] text-ink/50 mt-1">
        <span>{posts[0]?.published_at ? format(parseISO(posts[0].published_at), "dd/MM") : ""}</span>
        <span>
          {posts.at(-1)?.published_at ? format(parseISO(posts.at(-1)!.published_at!), "dd/MM") : ""}
        </span>
      </div>
      <p className="text-[12px] text-ink/50 mt-2">Passe o mouse em cada barra para ver o post.</p>
    </div>
  );
}
