import Link from "next/link";
import { Sunburst } from "@/components/ui/Sunburst";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-xl bg-orange text-white flex items-center justify-center shrink-0">
        <Sunburst size={18} />
      </span>
      {!compact ? (
        <span className="font-display-italic font-semibold text-[20px] text-ink">Método A.P.F.A</span>
      ) : null}
    </Link>
  );
}
