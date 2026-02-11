"use client";

import { WifiOff } from "lucide-react";
import { usePWA } from "@/lib/use-pwa";

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900">
      <span className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        You are offline. Some features may be unavailable.
      </span>
    </div>
  );
}
