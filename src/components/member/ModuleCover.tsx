import { Sunburst } from "@/components/ui/Sunburst";

export function ModuleCover({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <div className="cover-gradient relative h-32 rounded-t-2xl overflow-hidden">
      <Sunburst size={140} className="absolute -right-6 -top-8 text-white/10" />
      <Sunburst size={70} className="absolute right-4 bottom-4 text-white/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <span className="text-white/70 text-[11px] uppercase tracking-[0.22em] font-semibold mb-1">
          Pilar 0{numero}
        </span>
        <h3 className="font-display-italic text-white text-[24px] font-semibold leading-tight">{titulo}</h3>
      </div>
    </div>
  );
}
