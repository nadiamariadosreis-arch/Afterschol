"use client";

import { useState } from "react";
import { createPdfUploadUrlAction } from "@/lib/pdf-upload-actions";

type Status = "idle" | "uploading" | "done" | "error";

function uploadWithProgress(
  signedUrl: string,
  file: File,
  anonKey: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload falhou (status ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error("Falha de rede durante o upload."));

    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

/**
 * Uploads a PDF straight to Supabase Storage via a signed URL (browser
 * -> Storage directly, with real progress feedback), then exposes the
 * resulting path through a hidden form field so the enclosing <form>'s
 * server action just persists the path — no file bytes ever go through
 * the server action itself (Vercel hard-caps those at 4.5MB).
 *
 * Deliberately has no dependency on a browser Supabase client or
 * NEXT_PUBLIC_* env vars — everything it needs (signed URL, anon key)
 * comes back from the server action's response.
 */
export function PdfUploadField({
  name,
  path,
  hasExisting,
}: {
  name: string;
  path: string;
  hasExisting?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const result = await createPdfUploadUrlAction(path);
    if ("error" in result) {
      setStatus("error");
      setError(result.error);
      return;
    }

    try {
      await uploadWithProgress(result.signedUrl, file, result.anonKey, setProgress);
      setSavedPath(result.path);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não foi possível enviar o arquivo.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input type="file" accept="application/pdf" onChange={handleChange} className="text-[13px]" />
      <input type="hidden" name={name} value={savedPath ?? ""} />
      {status === "uploading" ? (
        <div className="flex items-center gap-2">
          <div className="w-32 h-1.5 bg-parchment-dark rounded-full overflow-hidden">
            <div className="h-full bg-moss transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[12px] text-ink/50">Enviando… {progress}%</span>
        </div>
      ) : status === "done" ? (
        <span className="text-[12px] text-moss">PDF pronto — clique em Salvar para confirmar.</span>
      ) : status === "error" ? (
        <span className="text-[12px] text-terracotta">{error}</span>
      ) : hasExisting ? (
        <span className="text-[12px] text-ink/40">Escolha um arquivo pra substituir o atual.</span>
      ) : null}
    </div>
  );
}
