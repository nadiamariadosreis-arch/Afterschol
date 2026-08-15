"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sunburst } from "@/components/ui/Sunburst";

const DISMISS_KEY = "apfa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type SafariNavigator = Navigator & { standalone?: boolean };

// Mini external store pro "fechar" ficar salvo no localStorage: assim um
// clique nesta mesma aba já avisa o useSyncExternalStore na hora
// (localStorage sozinho só dispara o evento "storage" em OUTRAS abas).
const dismissListeners = new Set<() => void>();
let dismissedCache: boolean | null = null;

function getDismissed() {
  if (dismissedCache === null) dismissedCache = localStorage.getItem(DISMISS_KEY) === "1";
  return dismissedCache;
}
function getDismissedServer() {
  return false;
}
function subscribeDismissed(callback: () => void) {
  dismissListeners.add(callback);
  return () => dismissListeners.delete(callback);
}
function markDismissed() {
  localStorage.setItem(DISMISS_KEY, "1");
  dismissedCache = true;
  dismissListeners.forEach((cb) => cb());
}

function getIsStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as SafariNavigator).standalone === true
  );
}
function getIsStandaloneServer() {
  return true; // esconde o banner até sabermos de verdade, no cliente
}
function subscribeStandalone(callback: () => void) {
  const mql = window.matchMedia("(display-mode: standalone)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
function getIsIOSServer() {
  return false;
}
function noopSubscribe() {
  return () => {};
}

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const isStandalone = useSyncExternalStore(subscribeStandalone, getIsStandalone, getIsStandaloneServer);
  const isIOS = useSyncExternalStore(noopSubscribe, getIsIOS, getIsIOSServer);
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissed, getDismissedServer);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="flex items-center gap-4 bg-card border border-line rounded-2xl px-5 py-4">
      <span className="w-10 h-10 rounded-xl bg-orange text-white flex items-center justify-center shrink-0">
        <Sunburst size={20} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-ink">Instale o app no seu celular</p>
        <p className="text-[13px] text-ink/60">
          {isIOS && showIOSInstructions
            ? 'Toque em Compartilhar (o ícone com a seta) e depois em "Adicionar à Tela de Início".'
            : "Acesso rápido, direto da tela inicial, sem precisar abrir o navegador."}
        </p>
      </div>
      {isIOS ? (
        <button
          type="button"
          onClick={() => setShowIOSInstructions((v) => !v)}
          className="shrink-0 text-[14px] font-semibold text-orange-dark hover:underline underline-offset-4"
        >
          Como instalar
        </button>
      ) : (
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold bg-orange text-white hover:bg-orange-dark transition-colors"
        >
          Instalar
        </button>
      )}
      <button
        type="button"
        onClick={markDismissed}
        aria-label="Fechar"
        className="shrink-0 text-ink/40 hover:text-ink/70 text-[18px] leading-none"
      >
        ×
      </button>
    </div>
  );
}
