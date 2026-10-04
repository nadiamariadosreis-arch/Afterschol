"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays, format, parseISO } from "date-fns";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  CHECKLIST_FIELDS,
  POSTS_PER_THEME,
  THEMES_PER_ACCOUNT,
  type ChecklistField,
} from "@/lib/instagram";
import type { IgPost, IgPostFormat } from "@/lib/supabase/types";

const FORMATS: IgPostFormat[] = ["carrossel", "reels", "estatico", "stories"];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function optionalInt(formData: FormData, key: string) {
  const raw = text(formData, key).replace(/\./g, "");
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** "1.234,56" ou "1234.56" → centavos. */
function optionalCents(formData: FormData, key: string) {
  let raw = text(formData, key).replace(/[^\d.,]/g, "");
  if (!raw) return null;
  if (raw.includes(",")) raw = raw.replace(/\./g, "").replace(",", ".");
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}

function accountPath(accountId: string) {
  return `/admin/instagram/${accountId}`;
}

function revalidateAccount(accountId: string) {
  revalidatePath(accountPath(accountId), "layout");
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// ---------------------------------------------------------------------------
// Perfis
// ---------------------------------------------------------------------------

export async function createAccountAction(formData: FormData) {
  await requireAdmin();

  const handle = text(formData, "handle").replace(/^@/, "");
  const name = text(formData, "name");
  if (!handle || !name) return;

  const supabase = await createClient();
  const { data: account, error } = await supabase
    .from("ig_accounts")
    .insert({
      handle,
      name,
      voice: optionalText(formData, "voice"),
      description: optionalText(formData, "description"),
    })
    .select("id")
    .single();

  if (error || !account) {
    fail("/admin/instagram", error?.message ?? "Não foi possível cadastrar o perfil.");
  }

  // Já nasce com a matriz 6x5 vazia, pronta para preencher.
  const { data: themes, error: themesError } = await supabase
    .from("ig_themes")
    .insert(
      Array.from({ length: THEMES_PER_ACCOUNT }, (_, i) => ({
        account_id: account.id,
        position: i + 1,
      })),
    )
    .select("id, position");

  if (themesError || !themes) {
    fail("/admin/instagram", themesError?.message ?? "Não foi possível criar a matriz.");
  }

  const { error: postsError } = await supabase.from("ig_posts").insert(
    themes.flatMap((theme) =>
      Array.from({ length: POSTS_PER_THEME }, (_, i) => ({
        account_id: account.id,
        theme_id: theme.id,
        position: i + 1,
      })),
    ),
  );

  if (postsError) fail("/admin/instagram", postsError.message);

  revalidatePath("/admin/instagram", "layout");
  redirect(`${accountPath(account.id)}/matriz`);
}

export async function updateAccountAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  const handle = text(formData, "handle").replace(/^@/, "");
  const name = text(formData, "name");
  if (!accountId || !handle || !name) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("ig_accounts")
    .update({
      handle,
      name,
      voice: optionalText(formData, "voice"),
      description: optionalText(formData, "description"),
      sort_order: optionalInt(formData, "sortOrder") ?? 0,
    })
    .eq("id", accountId);

  if (error) fail("/admin/instagram", error.message);

  revalidatePath("/admin/instagram", "layout");
}

export async function deleteAccountAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  if (!accountId) return;

  const supabase = await createClient();
  await supabase.from("ig_accounts").delete().eq("id", accountId);

  revalidatePath("/admin/instagram", "layout");
}

// ---------------------------------------------------------------------------
// Matriz
// ---------------------------------------------------------------------------

/** Salva uma linha da matriz: o nome do tema e os 5 títulos. */
export async function saveMatrixRowAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  const themeId = text(formData, "themeId");
  if (!accountId || !themeId) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("ig_themes")
    .update({ name: text(formData, "themeName") })
    .eq("id", themeId);

  if (error) fail(`${accountPath(accountId)}/matriz`, error.message);

  const postIds = formData.getAll("postId").map(String);
  const titles = formData.getAll("title").map((value) => String(value).trim());

  const results = await Promise.all(
    postIds.map((postId, i) =>
      supabase.from("ig_posts").update({ title: titles[i] ?? "" }).eq("id", postId),
    ),
  );
  const postError = results.find((result) => result.error)?.error;
  if (postError) fail(`${accountPath(accountId)}/matriz`, postError.message);

  revalidateAccount(accountId);
}

// ---------------------------------------------------------------------------
// Calendário
// ---------------------------------------------------------------------------

export async function schedulePostAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  const postId = text(formData, "postId");
  if (!accountId || !postId) return;

  const supabase = await createClient();
  await supabase
    .from("ig_posts")
    .update({ scheduled_date: optionalText(formData, "scheduledDate") })
    .eq("id", postId);

  revalidateAccount(accountId);
}

/**
 * Distribui no calendário os posts que ainda não têm data, a partir da
 * data inicial, só nos dias da semana escolhidos. Os temas se alternam:
 * post 1 de cada tema, depois post 2 de cada tema, e assim por diante.
 */
export async function autoScheduleAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  const start = text(formData, "startDate");
  const weekdays = formData.getAll("weekday").map(Number);
  const returnTo = `${accountPath(accountId)}/calendario`;
  if (!accountId || !start) return;
  if (weekdays.length === 0) fail(returnTo, "Escolha pelo menos um dia da semana para postar.");

  const supabase = await createClient();
  const [{ data: posts }, { data: themes }] = await Promise.all([
    supabase
      .from("ig_posts")
      .select("id, theme_id, position")
      .eq("account_id", accountId)
      .eq("published", false)
      .is("scheduled_date", null),
    supabase.from("ig_themes").select("id, position").eq("account_id", accountId),
  ]);

  const themeOrder = new Map((themes ?? []).map((theme) => [theme.id, theme.position]));
  const queue = (posts ?? []).sort(
    (a, b) =>
      a.position - b.position ||
      (themeOrder.get(a.theme_id) ?? 0) - (themeOrder.get(b.theme_id) ?? 0),
  );

  let day = parseISO(start);
  const updates = queue.map((post) => {
    while (!weekdays.includes(day.getDay())) day = addDays(day, 1);
    const scheduled = format(day, "yyyy-MM-dd");
    day = addDays(day, 1);
    return supabase.from("ig_posts").update({ scheduled_date: scheduled }).eq("id", post.id);
  });
  await Promise.all(updates);

  revalidateAccount(accountId);
  redirect(`${returnTo}?mes=${start.slice(0, 7)}`);
}

// ---------------------------------------------------------------------------
// Produção / checklist
// ---------------------------------------------------------------------------

export async function toggleStepAction(
  accountId: string,
  postId: string,
  field: ChecklistField,
  value: boolean,
) {
  await requireAdmin();
  if (!CHECKLIST_FIELDS.includes(field)) return;

  const update: Partial<IgPost> = { [field]: value };
  if (field === "published") {
    update.published_at = value ? format(new Date(), "yyyy-MM-dd") : null;
  }

  const supabase = await createClient();
  await supabase.from("ig_posts").update(update).eq("id", postId);

  revalidateAccount(accountId);
}

// ---------------------------------------------------------------------------
// Post completo
// ---------------------------------------------------------------------------

export async function updatePostAction(formData: FormData) {
  await requireAdmin();

  const accountId = text(formData, "accountId");
  const postId = text(formData, "postId");
  if (!accountId || !postId) return;

  const formatValue = text(formData, "format") as IgPostFormat;
  const published = formData.has("published");

  const supabase = await createClient();
  const { error } = await supabase
    .from("ig_posts")
    .update({
      title: text(formData, "title"),
      format: FORMATS.includes(formatValue) ? formatValue : "carrossel",
      scheduled_date: optionalText(formData, "scheduledDate"),
      notes: optionalText(formData, "notes"),

      uses_lead_magnet: formData.has("usesLeadMagnet"),
      lead_magnet_description: optionalText(formData, "leadMagnetDescription"),
      uses_manychat: formData.has("usesManychat"),
      manychat_keyword: optionalText(formData, "manychatKeyword"),
      sells_product: formData.has("sellsProduct"),
      product_name: optionalText(formData, "productName"),

      art_done: formData.has("art_done"),
      caption_done: formData.has("caption_done"),
      lead_magnet_done: formData.has("lead_magnet_done"),
      manychat_done: formData.has("manychat_done"),
      product_hosted_done: formData.has("product_hosted_done"),
      checkout_done: formData.has("checkout_done"),
      published,
      published_at: published
        ? (optionalText(formData, "publishedAt") ?? format(new Date(), "yyyy-MM-dd"))
        : null,
      post_url: optionalText(formData, "postUrl"),

      reach: optionalInt(formData, "reach"),
      likes: optionalInt(formData, "likes"),
      comments: optionalInt(formData, "comments"),
      saves: optionalInt(formData, "saves"),
      shares: optionalInt(formData, "shares"),
      new_followers: optionalInt(formData, "newFollowers"),

      mc_messages_sent: optionalInt(formData, "mcMessagesSent"),
      mc_link_clicks: optionalInt(formData, "mcLinkClicks"),
      mc_leads: optionalInt(formData, "mcLeads"),
      sales: optionalInt(formData, "sales"),
      revenue_cents: optionalCents(formData, "revenue"),
    })
    .eq("id", postId);

  const postPath = `${accountPath(accountId)}/posts/${postId}`;
  if (error) fail(postPath, error.message);

  revalidateAccount(accountId);
  redirect(`${postPath}?salvo=1`);
}
