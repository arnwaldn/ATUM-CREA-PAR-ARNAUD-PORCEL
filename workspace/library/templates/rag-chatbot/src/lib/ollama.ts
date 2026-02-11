import { createOllama } from 'ollama-ai-provider'

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2'

export const ollama = createOllama({
  baseURL: ollamaBaseUrl + '/api',
})

export const chatModel = ollama(ollamaModel)

export async function generateChatResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  context?: string
) {
  const systemMessage = context
    ? `Tu es un assistant helpful. Utilise le contexte suivant pour répondre aux questions:\n\n${context}\n\nSi le contexte ne contient pas l'information, dis-le clairement.`
    : 'Tu es un assistant helpful.'

  const fullMessages = [
    { role: 'system' as const, content: systemMessage },
    ...messages,
  ]

  return fullMessages
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/tags`)
    return response.ok
  } catch {
    return false
  }
}
