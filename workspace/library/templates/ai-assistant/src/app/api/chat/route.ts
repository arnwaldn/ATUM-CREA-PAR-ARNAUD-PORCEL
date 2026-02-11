import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { tools } from "@/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are a helpful AI assistant. You can use tools when needed to provide accurate information.
Be concise and helpful. When using tools, explain what you're doing.`,
    messages,
    tools,
    maxSteps: 5, // Allow multiple tool calls
  });

  return result.toDataStreamResponse();
}
