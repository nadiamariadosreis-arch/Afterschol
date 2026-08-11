"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setJogoPdfPathAction } from "./actions";

export function PdfUploadForm({ jogoId, hasExisting }: { jogoId: string; hasExisting: boolean }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");

    const supabase = createClient();
    const path = `${jogoId}.pdf`;
    const { error } = await supabase.storage.from("jogos-pdf").upload(path, file, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    await setJogoPdfPathAction(jogoId, path);
    setStatus("done");
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={status === "uploading"}
        className="text-[14px]"
      />
      {status === "uploading" ? <span className="text-ink/60 text-[14px]">Enviando…</span> : null}
      {status === "done" ? (
        <span className="text-teal-dark text-[14px]">Enviado com sucesso.</span>
      ) : null}
      {status === "error" ? (
        <span className="text-coral-dark text-[14px]">Erro: {errorMsg}</span>
      ) : null}
      {status === "idle" && hasExisting ? (
        <span className="text-ink/50 text-[14px]">Escolha um arquivo para substituir.</span>
      ) : null}
    </div>
  );
}
