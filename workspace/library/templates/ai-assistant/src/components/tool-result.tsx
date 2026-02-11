"use client";

import { ToolInvocation } from "ai";
import { Wrench, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ToolResultProps {
  toolInvocation: ToolInvocation;
}

export function ToolResult({ toolInvocation }: ToolResultProps) {
  const { toolName, state } = toolInvocation;

  if (state === "partial-call") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Calling {toolName}...</span>
      </div>
    );
  }

  if (state === "call") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wrench className="h-4 w-4" />
        <span>Using {toolName}...</span>
      </div>
    );
  }

  if (state === "result") {
    const result = toolInvocation.result;
    const hasError = result?.error;

    return (
      <div className="rounded-md border p-2 text-sm">
        <div className="flex items-center gap-2 mb-1">
          {hasError ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <span className="font-medium">{toolName}</span>
        </div>
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  return null;
}
