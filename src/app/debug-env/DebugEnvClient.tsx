"use client";

export function DebugEnvClient() {
  const clientValue = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(vazio/undefined)";

  return (
    <div>
      <h2 className="font-bold">Navegador (que veio embutido no build):</h2>
      <p className="break-all">{clientValue}</p>
    </div>
  );
}
