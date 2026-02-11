const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '500')
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '50')

export interface TextChunk {
  content: string
  index: number
  startChar: number
  endChar: number
}

export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = []
  const cleanedText = text.replace(/\s+/g, ' ').trim()

  if (cleanedText.length <= CHUNK_SIZE) {
    return [{
      content: cleanedText,
      index: 0,
      startChar: 0,
      endChar: cleanedText.length,
    }]
  }

  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + CHUNK_SIZE

    // Try to end at a sentence boundary
    if (endIndex < cleanedText.length) {
      const searchStart = Math.max(startIndex + CHUNK_SIZE - 100, startIndex)
      const searchEnd = Math.min(startIndex + CHUNK_SIZE + 100, cleanedText.length)
      const searchText = cleanedText.slice(searchStart, searchEnd)

      const sentenceEnd = searchText.search(/[.!?]\s/)
      if (sentenceEnd !== -1) {
        endIndex = searchStart + sentenceEnd + 1
      }
    }

    endIndex = Math.min(endIndex, cleanedText.length)

    chunks.push({
      content: cleanedText.slice(startIndex, endIndex).trim(),
      index: chunkIndex,
      startChar: startIndex,
      endChar: endIndex,
    })

    startIndex = endIndex - CHUNK_OVERLAP
    if (startIndex >= cleanedText.length - CHUNK_OVERLAP) break
    chunkIndex++
  }

  return chunks
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return data.text
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export function extractTextFromTXT(buffer: Buffer): string {
  return buffer.toString('utf-8')
}

export async function extractText(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop()

  switch (extension) {
    case 'pdf':
      return extractTextFromPDF(buffer)
    case 'docx':
      return extractTextFromDOCX(buffer)
    case 'txt':
    case 'md':
      return extractTextFromTXT(buffer)
    default:
      throw new Error(`Unsupported file type: ${extension}`)
  }
}
