/**
 * File Upload API
 *
 * Usage via Claude Code (langage naturel):
 * - "Upload un fichier pour l'utilisateur"
 * - "Gère l'upload d'images avec validation"
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadUserFile } from '@/lib/blob';
import { rateLimit } from '@/lib/kv';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting par IP
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const { allowed, remaining } = await rateLimit(`upload:${ip}`, 10, 60);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await uploadUserFile(file, userId);

    return NextResponse.json({
      success: true,
      file: result,
    }, {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
