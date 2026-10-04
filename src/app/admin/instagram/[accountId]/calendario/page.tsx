import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorNotice, STATUS_DOT, StatusLegend, inputClass } from "@/components/admin/instagram/ui";
import { loadMatrix, themeLabel } from "@/lib/instagram-data";
import { FORMAT_LABELS, STATUS_LABELS, postStatus } from "@/lib/instagram";
import { autoScheduleAction, schedulePostAction } from "../../actions";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ error?: string; mes?: string }>;
}) {
  const { accountId } = await params;
  const { error: saveError, mes } = await searchParams;
  const { posts, themeById } = await loadMatrix(accountId);

  const parsedMonth = mes && /^\d{4}-\d{2}$/.test(mes) ? parse(mes, "yyyy-MM", new Date()) : new Date();
  const month = startOfMonth(parsedMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(month),
    end: endOfWeek(endOfMonth(month)),
  });

  const base = `/admin/instagram/${accountId}`;
  const monthHref = (date: Date) => `${base}/calendario?mes=${format(date, "yyyy-MM")}`;
  const unscheduled = posts.filter((post) => !post.scheduled_date && !post.published);

  return (
    <div>
      <ErrorNotice message={saveError} />

      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href={monthHref(addMonths(month, -1))} className="text-ink/60 hover:text-moss text-[15px]">
          ← Anterior
        </Link>
        <h3 className="font-display italic font-semibold text-[26px] text-ink capitalize">
          {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <Link href={monthHref(addMonths(month, 1))} className="text-ink/60 hover:text-moss text-[15px]">
          Próximo →
        </Link>
      </div>

      <StatusLegend />

      <div className="overflow-x-auto mb-10">
        <div className="grid grid-cols-7 min-w-[720px] border-l border-t border-line">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="border-r border-b border-line bg-cream px-2 py-1.5 text-[12px] uppercase tracking-[0.15em] text-ink/60"
            >
              {day}
            </div>
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayPosts = posts.filter((post) => post.scheduled_date === key);
            return (
              <div
                key={key}
                className={`border-r border-b border-line min-h-[104px] p-1.5 flex flex-col gap-1 ${
                  isSameMonth(day, month) ? "bg-card" : "bg-parchment-dark/40"
                }`}
              >
                <span
                  className={`text-[12px] self-end w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday(day) ? "bg-moss text-parchment" : "text-ink/50"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayPosts.map((post) => {
                  const status = postStatus(post);
                  const theme = themeById.get(post.theme_id);
                  return (
                    <Link
                      key={post.id}
                      href={`${base}/posts/${post.id}`}
                      title={`${themeLabel(theme)} · ${FORMAT_LABELS[post.format]} · ${STATUS_LABELS[status]}`}
                      className="flex items-start gap-1.5 rounded-sm bg-cream hover:bg-gold/15 px-1.5 py-1 text-[12px] leading-snug text-ink"
                    >
                      <span className={`mt-1 shrink-0 w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                      <span className="line-clamp-2">
                        {post.title.trim() || `Post ${theme?.position}.${post.position}`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading font-semibold text-[18px] text-ink mb-1">
            Distribuir automaticamente
          </h3>
          <p className="text-ink/60 text-[13px] mb-4">
            Coloca no calendário os {unscheduled.length} posts sem data, alternando os temas
            (1º post de cada tema, depois o 2º…), só nos dias que você escolher.
          </p>
          <form action={autoScheduleAction} className="flex flex-col gap-3 text-[14px]">
            <input type="hidden" name="accountId" value={accountId} />
            <label className="flex flex-col gap-1">
              <span className="text-ink/70">Começar em</span>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                className={`${inputClass} w-48`}
              />
            </label>
            <fieldset className="flex flex-wrap gap-3">
              <legend className="text-ink/70 mb-1">Dias de postagem</legend>
              {WEEKDAYS.map((day, index) => (
                <label key={day} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="weekday"
                    value={index}
                    defaultChecked={index >= 1 && index <= 5}
                    className="accent-moss"
                  />
                  {day}
                </label>
              ))}
            </fieldset>
            <Button
              type="submit"
              variant="primary"
              className="self-start"
              disabled={unscheduled.length === 0}
            >
              Distribuir posts
            </Button>
          </form>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold text-[18px] text-ink mb-4">
            Sem data ({unscheduled.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {unscheduled.map((post) => {
              const theme = themeById.get(post.theme_id);
              return (
                <form
                  key={post.id}
                  action={schedulePostAction}
                  className="flex items-center gap-2 text-[13px] border-b border-line pb-2"
                >
                  <input type="hidden" name="accountId" value={accountId} />
                  <input type="hidden" name="postId" value={post.id} />
                  <div className="flex-1 min-w-0">
                    <div className="text-ink/50 text-[11px] uppercase tracking-[0.1em] truncate">
                      {themeLabel(theme)}
                    </div>
                    <div className="text-ink truncate">
                      {post.title.trim() || `Post ${theme?.position}.${post.position} (sem título)`}
                    </div>
                  </div>
                  <input type="date" name="scheduledDate" required className={`${inputClass} !py-1 !px-2 text-[13px]`} />
                  <button type="submit" className="text-moss hover:underline">
                    OK
                  </button>
                </form>
              );
            })}
            {unscheduled.length === 0 ? (
              <p className="text-ink/60 text-[14px]">Todos os posts já estão no calendário. 🎉</p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
