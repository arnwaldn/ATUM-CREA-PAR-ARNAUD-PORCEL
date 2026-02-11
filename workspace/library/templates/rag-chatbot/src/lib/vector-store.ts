import { PrismaClient } from '@prisma/client'
import { generateEmbedding } from './embeddings'

const prisma = new PrismaClient()

export interface SearchResult {
  id: string
  content: string
  similarity: number
  documentId: string
}

export async function storeChunkWithEmbedding(
  content: string,
  documentId: string
): Promise<string> {
  const embedding = await generateEmbedding(content)
  const embeddingStr = `[${embedding.join(',')}]`

  const chunk = await prisma.$executeRaw`
    INSERT INTO "Chunk" (id, content, embedding, "documentId", "createdAt")
    VALUES (
      gen_random_uuid()::text,
      ${content},
      ${embeddingStr}::vector,
      ${documentId},
      NOW()
    )
    RETURNING id
  `

  return chunk.toString()
}

export async function searchSimilarChunks(
  query: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query)
  const embeddingStr = `[${queryEmbedding.join(',')}]`

  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      id,
      content,
      "documentId",
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM "Chunk"
    WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `

  return results
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  await prisma.chunk.deleteMany({
    where: { documentId },
  })
}

export async function getDocumentCount(): Promise<number> {
  return prisma.document.count()
}

export async function getChunkCount(): Promise<number> {
  return prisma.chunk.count()
}
