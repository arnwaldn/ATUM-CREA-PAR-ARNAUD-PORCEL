"use client";

import { Download, Wifi, WifiOff, Bell, Share2 } from "lucide-react";
import { usePWA } from "@/lib/use-pwa";

export default function Home() {
  const { isInstalled, isOnline, canInstall, installApp } = usePWA();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="mx-auto h-24 w-24 rounded-2xl bg-primary flex items-center justify-center">
          <span className="text-4xl font-bold text-primary-foreground">P</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Progressive Web App
          </h1>
          <p className="text-muted-foreground">
            Install this app on your device for the best experience
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span>Connection Status</span>
            </div>
            <span className={isOnline ? "text-green-500" : "text-red-500"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Installation Status */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5" />
              <span>Installation</span>
            </div>
            <span className={isInstalled ? "text-green-500" : "text-muted-foreground"}>
              {isInstalled ? "Installed" : "Not installed"}
            </span>
          </div>
        </div>

        {/* Install Button */}
        {canInstall && !isInstalled && (
          <button
            onClick={installApp}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <span className="flex items-center justify-center gap-2">
              <Download className="h-5 w-5" />
              Install App
            </span>
          </button>
        )}

        {/* Features */}
        <div className="space-y-4 pt-8">
          <h2 className="text-lg font-semibold">PWA Features</h2>
          <div className="grid gap-3 text-left text-sm">
            <Feature
              icon={<Download className="h-4 w-4" />}
              title="Installable"
              description="Add to home screen for quick access"
            />
            <Feature
              icon={<WifiOff className="h-4 w-4" />}
              title="Offline Support"
              description="Works even without internet connection"
            />
            <Feature
              icon={<Bell className="h-4 w-4" />}
              title="Push Notifications"
              description="Receive updates and alerts"
            />
            <Feature
              icon={<Share2 className="h-4 w-4" />}
              title="Web Share API"
              description="Share content with native apps"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
