// Global install prompt manager — captures beforeinstallprompt early and shares it

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: Array<(prompt: BeforeInstallPromptEvent | null) => void> = [];

// Capture the event as early as possible
window.addEventListener("beforeinstallprompt", (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  listeners.forEach((fn) => fn(deferredPrompt));
});

export function getInstallPrompt() {
  return deferredPrompt;
}

export function onInstallPromptChange(fn: (prompt: BeforeInstallPromptEvent | null) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export async function triggerInstall(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (deferredPrompt) {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((fn) => fn(null));
    return outcome;
  }
  return "unavailable";
}

export function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window as any).Capacitor?.isNativePlatform?.();
}

export function isIOSDevice() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}
