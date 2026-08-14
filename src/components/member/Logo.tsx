import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span className="w-9 h-9 rounded-full bg-orange text-white flex items-center justify-center font-display-italic font-semibold text-[17px]">
        A
      </span>
      {!compact ? (
        <span className="font-display-italic font-semibold text-[20px] text-ink">Método A.P.F.A</span>
      ) : null}
    </Link>
  );
}
