"use client";

import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <h1 className="text-xl font-semibold">
          {process.env.NEXT_PUBLIC_APP_NAME || "AI Assistant"}
        </h1>
      </header>
      <ChatInterface />
    </main>
  );
}
