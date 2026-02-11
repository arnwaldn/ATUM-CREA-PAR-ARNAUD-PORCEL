import { streamText } from 'ai'
import { chatModel, generateChatResponse } from '@/lib/ollama'
import { searchSimilarChunks } from '@/lib/vector-store'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { messages, useRAG = true } = await request.json()

  const lastUserMessage = messages
    .filter((m: { role: string }) => m.role === 'user')
    .pop()?.content

  let context = ''

  if (useRAG && lastUserMessage) {
    try {
      const relevantChunks = await searchSimilarChunks(lastUserMessage, 5, 0.6)

      if (relevantChunks.length > 0) {
        context = relevantChunks
          .map((chunk, i) => `[Source ${i + 1}]: ${chunk.content}`)
          .join('\n\n')
      }
    } catch (error) {
      console.error('RAG search error:', error)
    }
  }

  const systemMessage = context
    ? `Tu es un assistant helpful. Utilise le contexte suivant pour répondre aux questions de manière précise et informative:

${context}

Instructions:
- Base tes réponses sur le contexte fourni
- Si le contexte ne contient pas l'information demandée, dis-le clairement
- Cite les sources quand c'est pertinent`
    : 'Tu es un assistant helpful. Réponds de manière claire et concise.'

  const result = streamText({
    model: chatModel,
    system: systemMessage,
    messages,
  })

  return result.toDataStreamResponse()
}
