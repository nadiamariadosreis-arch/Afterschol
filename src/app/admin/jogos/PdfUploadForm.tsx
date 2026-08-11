"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { setJogoPdfPathAction } from "./actions";

export function PdfUploadForm({ jogoId, hasExisting }: { jogoId: string; hasExisting: boolean }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setStatus("error");
      setErrorMsg("Sessão expirada, recarregue a página e faça login de novo.");
      return;
    }

    const path = `${jogoId}.pdf`;

    try {
      await uploadWithProgress({
        url: `${supabaseUrl()}/storage/v1/object/jogos-pdf/${path}`,
        file,
        contentType: "application/pdf",
        accessToken: session.access_token,
        onProgress: setProgress,
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Falha no envio.");
      return;
    }

    await setJogoPdfPathAction(jogoId, path);
    setStatus("done");
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={status === "uploading"}
        className="text-[14px]"
      />
      {status === "uploading" ? (
        <div className="flex items-center gap-3 max-w-xs">
          <div className="flex-1 h-2 rounded-full bg-cream-dark overflow-hidden">
            <div
              className="h-full bg-coral rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-ink/60 text-[13px] tabular-nums">{progress}%</span>
        </div>
      ) : null}
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

function uploadWithProgress({
  url,
  file,
  contentType,
  accessToken,
  onProgress,
}: {
  url: string;
  file: File;
  contentType: string;
  accessToken: string;
  onProgress: (percent: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey());
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Servidor recusou o arquivo (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Falha de rede durante o envio."));

    xhr.send(file);
  });
}
