import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_TONES, type PostStatus } from "@/lib/instagram";

export const inputClass =
  "border border-line bg-parchment rounded-sm px-3 py-2 font-body text-ink outline-none focus:border-moss";

export function ErrorNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 bg-terracotta/10 border border-terracotta/40 rounded-sm px-5 py-4">
      <p className="text-terracotta font-semibold text-[14px]">Não foi possível salvar</p>
      <p className="text-ink/70 text-[13px] mt-1">{message}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export const STATUS_DOT: Record<PostStatus, string> = {
  ideia: "bg-line",
  producao: "bg-terracotta",
  pronto: "bg-gold",
  publicado: "bg-moss",
};

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full bg-parchment-dark rounded-full overflow-hidden" title={`${percent}%`}>
      <div className="h-full bg-moss rounded-full" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function StatusLegend() {
  const statuses: PostStatus[] = ["ideia", "producao", "pronto", "publicado"];
  return (
    <div className="flex gap-4 flex-wrap text-[13px] text-ink/60 mb-4">
      {statuses.map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_LABELS[status]}
        </span>
      ))}
    </div>
  );
}
