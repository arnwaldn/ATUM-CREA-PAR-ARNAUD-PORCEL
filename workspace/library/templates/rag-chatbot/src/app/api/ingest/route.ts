import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { extractText, chunkText } from '@/lib/chunker'
import { storeChunkWithEmbedding } from '@/lib/vector-store'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = file.name

    // Extract text from document
    const text = await extractText(buffer, filename)

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from document' },
        { status: 400 }
      )
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        filename,
        content: text,
      },
    })

    // Chunk the text
    const chunks = chunkText(text)

    // Store chunks with embeddings
    let processedChunks = 0
    for (const chunk of chunks) {
      try {
        await storeChunkWithEmbedding(chunk.content, document.id)
        processedChunks++
      } catch (error) {
        console.error(`Error processing chunk ${chunk.index}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      filename,
      totalChunks: chunks.length,
      processedChunks,
      message: `Document "${filename}" indexed successfully with ${processedChunks} chunks`,
    })
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { documentId } = await request.json()

    await prisma.document.delete({
      where: { id: documentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
