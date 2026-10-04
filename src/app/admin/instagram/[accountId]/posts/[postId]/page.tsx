import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, ProgressBar, StatusBadge, inputClass } from "@/components/admin/instagram/ui";
import { themeLabel } from "@/lib/instagram-data";
import { FORMAT_LABELS, postProgress, postStatus } from "@/lib/instagram";
import type { IgPost, IgPostFormat } from "@/lib/supabase/types";
import { updatePostAction } from "../../../actions";

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string; postId: string }>;
  searchParams: Promise<{ error?: string; salvo?: string }>;
}) {
  const { accountId, postId } = await params;
  const { error: saveError, salvo } = await searchParams;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("ig_posts")
    .select("*")
    .eq("id", postId)
    .eq("account_id", accountId)
    .maybeSingle();
  if (!post) notFound();

  const { data: theme } = await supabase
    .from("ig_themes")
    .select("*")
    .eq("id", post.theme_id)
    .maybeSingle();

  const progress = postProgress(post);
  const revenue =
    post.revenue_cents != null
      ? (post.revenue_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
      : "";

  return (
    <div>
      <ErrorNotice message={saveError} />
      {salvo ? (
        <div className="mb-6 bg-moss/10 border border-moss/40 rounded-sm px-5 py-3 text-moss-dark text-[14px]">
          Post salvo ✓
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-[13px] tracking-[0.15em] uppercase text-moss">
            {theme ? `${theme.position}. ${themeLabel(theme)}` : "Tema"} · Post{" "}
            {theme?.position}.{post.position}
          </div>
          <h3 className="font-display italic font-semibold text-[26px] text-ink">
            {post.title.trim() || "Post sem título"}
          </h3>
        </div>
        <div className="flex items-center gap-3 min-w-[220px]">
          <StatusBadge status={postStatus(post)} />
          <ProgressBar percent={progress.percent} />
          <span className="text-[13px] text-ink/60">
            {progress.done}/{progress.total}
          </span>
        </div>
      </div>

      <form action={updatePostAction} className="flex flex-col gap-6 text-[14px]">
        <input type="hidden" name="accountId" value={accountId} />
        <input type="hidden" name="postId" value={post.id} />

        <Section title="1. Conteúdo">
          <Field label="Título" className="md:col-span-2">
            <input type="text" name="title" defaultValue={post.title} className={inputClass} />
          </Field>
          <Field label="Formato">
            <select name="format" defaultValue={post.format} className={inputClass}>
              {(Object.keys(FORMAT_LABELS) as IgPostFormat[]).map((value) => (
                <option key={value} value={value}>
                  {FORMAT_LABELS[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data de postagem">
            <input
              type="date"
              name="scheduledDate"
              defaultValue={post.scheduled_date ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Anotações (roteiro, ideias, referências)" className="md:col-span-2">
            <textarea name="notes" rows={4} defaultValue={post.notes ?? ""} className={inputClass} />
          </Field>
        </Section>

        <Section title="2. O que este post precisa" hint="Marque o que se aplica — o checklist se ajusta.">
          <Toggle name="usesLeadMagnet" label="Tem isca / presente" checked={post.uses_lead_magnet} />
          <Field label="Qual isca ou presente?">
            <input
              type="text"
              name="leadMagnetDescription"
              defaultValue={post.lead_magnet_description ?? ""}
              placeholder="ex: PDF com 10 dinâmicas"
              className={inputClass}
            />
          </Field>
          <Toggle name="usesManychat" label="Usa automação no ManyChat" checked={post.uses_manychat} />
          <Field label="Palavra-chave do ManyChat">
            <input
              type="text"
              name="manychatKeyword"
              defaultValue={post.manychat_keyword ?? ""}
              placeholder="ex: QUERO"
              className={inputClass}
            />
          </Field>
          <Toggle name="sellsProduct" label="Vende um produto" checked={post.sells_product} />
          <Field label="Qual produto?">
            <input
              type="text"
              name="productName"
              defaultValue={post.product_name ?? ""}
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="3. Checklist de produção">
          <ChecklistBox post={post} field="art_done" label="Arte criada" />
          <ChecklistBox post={post} field="caption_done" label="Legenda escrita" />
          <ChecklistBox post={post} field="lead_magnet_done" label="Isca / presente pronto" />
          <ChecklistBox post={post} field="manychat_done" label="Fluxo criado no ManyChat" />
          <ChecklistBox post={post} field="product_hosted_done" label="Produto hospedado na plataforma" />
          <ChecklistBox post={post} field="checkout_done" label="Checkout configurado" />
        </Section>

        <Section title="4. Publicação">
          <Toggle name="published" label="Publicado ✓" checked={post.published} />
          <Field label="Publicado em">
            <input
              type="date"
              name="publishedAt"
              defaultValue={post.published_at ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Link do post" className="md:col-span-2">
            <input
              type="url"
              name="postUrl"
              defaultValue={post.post_url ?? ""}
              placeholder="https://www.instagram.com/p/…"
              className={inputClass}
            />
          </Field>
        </Section>

        <Section title="5. Resultados do post" hint="Copie dos Insights do Instagram (uns 7 dias depois de postar).">
          <NumberField name="reach" label="Alcance" value={post.reach} />
          <NumberField name="likes" label="Curtidas" value={post.likes} />
          <NumberField name="comments" label="Comentários" value={post.comments} />
          <NumberField name="saves" label="Salvamentos" value={post.saves} />
          <NumberField name="shares" label="Compartilhamentos" value={post.shares} />
          <NumberField name="newFollowers" label="Novos seguidores" value={post.new_followers} />
        </Section>

        <Section title="6. Resultados do ManyChat e vendas">
          <NumberField name="mcMessagesSent" label="Pessoas que receberam a mensagem" value={post.mc_messages_sent} />
          <NumberField name="mcLinkClicks" label="Cliques no link" value={post.mc_link_clicks} />
          <NumberField name="mcLeads" label="Leads (e-mails / contatos)" value={post.mc_leads} />
          <NumberField name="sales" label="Vendas" value={post.sales} />
          <Field label="Faturamento (R$)">
            <input
              type="text"
              inputMode="decimal"
              name="revenue"
              defaultValue={revenue}
              placeholder="0,00"
              className={inputClass}
            />
          </Field>
        </Section>

        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary">
            Salvar post
          </Button>
          <Link href={`/admin/instagram/${accountId}/producao`} className="text-ink/60 hover:text-moss">
            Voltar para a produção
          </Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card className="!p-6">
      <h4 className="font-heading font-semibold text-[17px] text-ink">{title}</h4>
      {hint ? <p className="text-ink/50 text-[13px] mt-0.5">{hint}</p> : null}
      <div className="grid md:grid-cols-2 gap-4 mt-4">{children}</div>
    </Card>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function NumberField({ name, label, value }: { name: string; label: string; value: number | null }) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        name={name}
        defaultValue={value ?? ""}
        className={inputClass}
      />
    </Field>
  );
}

function Toggle({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex items-center gap-2 self-end py-2">
      <input type="checkbox" name={name} defaultChecked={checked} className="w-[18px] h-[18px] accent-moss" />
      <span className="text-ink">{label}</span>
    </label>
  );
}

function ChecklistBox({
  post,
  field,
  label,
}: {
  post: IgPost;
  field: "art_done" | "caption_done" | "lead_magnet_done" | "manychat_done" | "product_hosted_done" | "checkout_done";
  label: string;
}) {
  return <Toggle name={field} label={label} checked={post[field]} />;
}
