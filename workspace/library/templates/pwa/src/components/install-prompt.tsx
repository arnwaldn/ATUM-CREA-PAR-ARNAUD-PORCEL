"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { usePWA } from "@/lib/use-pwa";

export function InstallPrompt() {
  const { canInstall, isInstalled, isIOSDevice, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user dismissed prompt before
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after 30 seconds if app can be installed
    const timer = setTimeout(() => {
      if ((canInstall || isIOSDevice) && !isInstalled) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled, isIOSDevice]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt || dismissed || isInstalled) {
    return null;
  }

  // iOS-specific prompt
  if (isIOSDevice) {
    return (
      <div className="fixed inset-x-4 bottom-4 z-50 animate-slide-up">
        <div className="rounded-xl bg-card border shadow-lg p-4">
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4 pr-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary-foreground">P</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Install this app</h3>
              <p className="text-sm text-muted-foreground">
                Tap <Share className="inline h-4 w-4" /> then &quot;Add to Home Screen&quot; to install
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 animate-slide-up">
      <div className="rounded-xl bg-card border shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-foreground">P</span>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold">Install App</h3>
              <p className="text-sm text-muted-foreground">
                Install for quick access and offline support
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <span className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Install
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
