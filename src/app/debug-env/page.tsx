import { DebugEnvClient } from "./DebugEnvClient";

export const dynamic = "force-dynamic";

export default function DebugEnvPage() {
  const serverValue = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(vazio/undefined)";

  return (
    <main className="p-8 flex flex-col gap-6">
      <div>
        <h2 className="font-bold">Servidor (renderizado agora, no request):</h2>
        <p className="break-all">{serverValue}</p>
      </div>
      <DebugEnvClient />
    </main>
  );
}
