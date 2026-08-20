"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [isIOS] = useState(isIOSDevice);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed || (!deferredPrompt && !isIOS)) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <Card className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-ink">Instale como app no seu celular</p>
        {isIOS ? (
          <p className="mt-1 text-sm text-ink-soft">
            No Safari, toque em <span className="font-medium">Compartilhar</span> e depois em{" "}
            <span className="font-medium">&quot;Adicionar à Tela de Início&quot;</span>.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">
            Acesse mais rápido, direto da tela inicial, como um aplicativo de verdade.
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {!isIOS && (
          <Button onClick={handleInstall} className="whitespace-nowrap">
            Instalar app
          </Button>
        )}
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Agora não
        </Button>
      </div>
    </Card>
  );
}
