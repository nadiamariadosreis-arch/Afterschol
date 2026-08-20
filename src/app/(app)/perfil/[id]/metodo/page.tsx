import { createClient } from "@/lib/supabase/server";
import { PageFade } from "@/components/motion";
import type { Method, MethodSource } from "@/lib/types";
import { MetodoClient } from "./metodo-client";

export default async function MetodoPage({ params }: PageProps<"/perfil/[id]/metodo">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: method } = await supabase
    .from("methods")
    .select("*")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sources: MethodSource[] = [];
  if (method) {
    const { data } = await supabase
      .from("method_sources")
      .select("*")
      .eq("method_id", method.id)
      .order("created_at", { ascending: true });
    sources = (data as MethodSource[]) ?? [];
  }

  return (
    <PageFade>
      <h1 className="font-display text-xl font-semibold">3. Método</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Transforme o conteúdo do seu produto pago em pautas gratuitas que mostram sua
        competência de verdade, sem entregar tudo. Descreva o resultado que ele entrega, envie
        materiais e deixe a IA organizar em pilares e processos que vão orientar o conteúdo.
      </p>
      <MetodoClient profileId={id} method={method as Method | null} sources={sources} />
    </PageFade>
  );
}
