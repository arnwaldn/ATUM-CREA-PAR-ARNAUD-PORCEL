# File Upload & Storage Patterns

> **Version**: v1.0 | ATUM CREA
> **Stack**: Next.js 15 + Supabase Storage / UploadThing / S3
> **Principe**: Signed URLs (ne jamais faire transiter les fichiers par le serveur Next.js)

---

## Table des Matieres

1. [Architecture Signed URL](#architecture-signed-url)
2. [Supabase Storage (Recommande)](#supabase-storage-recommande)
3. [UploadThing (Alternative DX)](#uploadthing-alternative-dx)
4. [AWS S3 Presigned URLs](#aws-s3-presigned-urls)
5. [Composant Upload React](#composant-upload-react)
6. [Validation & Securite](#validation--securite)
7. [Patterns Avances](#patterns-avances)
8. [Checklist](#checklist)

---

## Architecture Signed URL

```
Client                    Server (API Route)           Storage (S3/Supabase)
  │                            │                            │
  │  1. Demande upload URL     │                            │
  │ ─────────────────────────> │                            │
  │                            │  2. Genere signed URL      │
  │                            │ ─────────────────────────> │
  │                            │  3. Retourne signed URL    │
  │  4. Recoit signed URL     │ <───────────────────────── │
  │ <───────────────────────── │                            │
  │                            │                            │
  │  5. Upload DIRECT vers storage                          │
  │ ────────────────────────────────────────────────────────>│
  │                            │                            │
  │  6. Confirme au serveur    │                            │
  │ ─────────────────────────> │  7. Verifie existence     │
  │                            │ ─────────────────────────> │
  │                            │  8. Enregistre en DB       │
```

> **Pourquoi signed URLs ?** : Le body limit de Next.js est ~1MB par defaut. Les signed URLs contournent cette limite en uploadant directement vers le storage.

---

## Supabase Storage (Recommande)

### Configuration bucket

```sql
-- Migration : creer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,                    -- Prive par defaut
  52428800,                 -- 50MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- RLS: upload autorise pour les users authentifies
CREATE POLICY "Users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: lecture de ses propres fichiers
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: suppression de ses propres fichiers
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### API Route - Signed URL

```typescript
// app/api/upload/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName, fileType, fileSize } = await request.json();

  // Validation
  if (!ALLOWED_TYPES.includes(fileType)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }
  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Generer un nom unique
  const ext = fileName.split('.').pop();
  const uniqueName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  // Creer le signed URL
  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(uniqueName);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: uniqueName,
  });
}
```

### Upload depuis le client

```typescript
// lib/upload.ts
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UploadResult = {
  path: string;
  url: string;
};

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  // 1. Obtenir le signed URL
  const response = await fetch('/api/upload/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to get upload URL');
  }

  const { signedUrl, token, path } = await response.json();

  // 2. Upload direct vers Supabase Storage
  const { error } = await supabase.storage
    .from('uploads')
    .uploadToSignedUrl(path, token, file, {
      upsert: false,
    });

  if (error) throw error;

  // 3. Obtenir l'URL publique (ou signee pour les fichiers prives)
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(path);

  return {
    path,
    url: urlData.publicUrl,
  };
}

// Upload avec progression via XHR (pour la barre de progression)
export function uploadFileWithProgress(
  file: File,
  signedUrl: string,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}
```

---

## UploadThing (Alternative DX)

DX TypeScript-first, ideal pour les prototypes rapides.

```bash
pnpm add uploadthing @uploadthing/react
```

```typescript
// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@/lib/auth';

const f = createUploadthing();

export const uploadRouter = {
  avatar: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Sauvegarder en DB
      await db.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: file.url },
      });
      return { url: file.url };
    }),

  document: f({ pdf: { maxFileSize: '16MB', maxFileCount: 5 } })
    .middleware(async () => {
      const user = await auth();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
```

```typescript
// app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next';
import { uploadRouter } from '@/lib/uploadthing';

export const { GET, POST } = createRouteHandler({ router: uploadRouter });
```

```typescript
// components/upload-button.tsx
'use client';

import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/lib/uploadthing';

export function AvatarUpload() {
  return (
    <UploadButton<OurFileRouter, 'avatar'>
      endpoint="avatar"
      onClientUploadComplete={(res) => {
        console.log('Upload done:', res);
      }}
      onUploadError={(error) => {
        console.error('Upload error:', error);
      }}
    />
  );
}
```

---

## AWS S3 Presigned URLs

Pour les projets avec infrastructure AWS existante.

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1h
}

export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
```

---

## Composant Upload React

```typescript
// components/file-upload.tsx
'use client';

import { useCallback, useState } from 'react';
import { uploadFile } from '@/lib/upload';

type FileUploadProps = {
  accept?: string;
  maxSize?: number; // bytes
  onUpload: (result: { path: string; url: string }) => void;
  onError?: (error: Error) => void;
};

export function FileUpload({
  accept = 'image/*,application/pdf',
  maxSize = 50 * 1024 * 1024,
  onUpload,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxSize) {
        onError?.(new Error(`File exceeds ${maxSize / 1024 / 1024}MB limit`));
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadFile(file, setProgress);
        onUpload(result);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Upload failed'));
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [maxSize, onUpload, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
      `}
    >
      {uploading ? (
        <div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">{progress}%</p>
        </div>
      ) : (
        <>
          <p>Glissez un fichier ici ou</p>
          <label className="mt-2 inline-block cursor-pointer text-blue-600 underline">
            parcourir
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}
```

---

## Validation & Securite

### Validation MIME cote serveur

```typescript
// lib/validate-file.ts
import { fileTypeFromBuffer } from 'file-type';

const SAFE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'text/csv': ['.csv'],
};

export async function validateFileType(
  buffer: Buffer,
  declaredType: string
): Promise<boolean> {
  const detected = await fileTypeFromBuffer(buffer);

  // Verifier que le type detecte correspond au type declare
  if (detected && detected.mime !== declaredType) {
    return false;
  }

  return declaredType in SAFE_TYPES;
}
```

### Regles de securite

1. **JAMAIS** faire confiance au `Content-Type` du client seul — toujours verifier avec `file-type`
2. **JAMAIS** stocker les fichiers avec le nom original — generer un UUID
3. **TOUJOURS** limiter la taille max par type de fichier
4. **TOUJOURS** utiliser des signed URLs avec expiration
5. **TOUJOURS** scanner les fichiers uploades (optionnel : ClamAV)
6. **JAMAIS** servir les fichiers depuis le meme domaine que l'app (risque XSS via SVG)

---

## Patterns Avances

### Upload d'images avec redimensionnement

```typescript
// lib/image-resize.ts
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to resize'));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
```

### Multi-upload avec queue

```typescript
// lib/upload-queue.ts
type UploadTask = {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  result?: { path: string; url: string };
  error?: Error;
};

export class UploadQueue {
  private tasks: UploadTask[] = [];
  private concurrency: number;
  private active = 0;
  private onChange: (tasks: UploadTask[]) => void;

  constructor(concurrency = 3, onChange: (tasks: UploadTask[]) => void) {
    this.concurrency = concurrency;
    this.onChange = onChange;
  }

  add(files: File[]) {
    const newTasks = files.map((file) => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    this.tasks = [...this.tasks, ...newTasks];
    this.onChange([...this.tasks]);
    this.processNext();
  }

  private async processNext() {
    if (this.active >= this.concurrency) return;

    const next = this.tasks.find((t) => t.status === 'pending');
    if (!next) return;

    this.active++;
    next.status = 'uploading';
    this.onChange([...this.tasks]);

    try {
      const result = await uploadFile(next.file, (p) => {
        next.progress = p;
        this.onChange([...this.tasks]);
      });
      next.status = 'done';
      next.result = result;
    } catch (error) {
      next.status = 'error';
      next.error = error instanceof Error ? error : new Error('Upload failed');
    }

    this.active--;
    this.onChange([...this.tasks]);
    this.processNext();
  }
}
```

---

## Checklist

### Setup
- [ ] Bucket cree avec `allowed_mime_types` et `file_size_limit`
- [ ] RLS configures (upload, lecture, suppression)
- [ ] API route pour generer les signed URLs
- [ ] Validation MIME cote serveur

### Composant
- [ ] Drag & drop support
- [ ] Barre de progression
- [ ] Validation taille/type cote client (feedback immediat)
- [ ] Gestion d'erreur avec messages clairs
- [ ] Multi-upload avec queue (si necessaire)

### Production
- [ ] Signed URLs avec expiration courte (1h max)
- [ ] Noms de fichiers generes (UUID, pas le nom original)
- [ ] Fichiers servis depuis un sous-domaine ou CDN
- [ ] Cleanup des fichiers orphelins (cron ou Edge Function)
- [ ] Monitoring de l'espace de stockage utilise

---

## Decision : Quel service choisir ?

| Critere | Supabase Storage | UploadThing | AWS S3 |
|---------|-----------------|-------------|--------|
| **DX** | Bon | Excellent | Moyen |
| **Prix** | Inclus (plan Pro) | Freemium | A l'usage |
| **Controle** | Moyen | Faible | Total |
| **RLS/Securite** | Integre | Middleware | IAM policies |
| **CDN** | Oui | Oui | CloudFront |
| **Recommande si** | Stack Supabase | Prototype rapide | Infra AWS existante |

> **Recommandation ATUM CREA** : Supabase Storage si le projet utilise deja Supabase. UploadThing pour un prototype. S3 pour une infrastructure AWS existante.

---

*Knowledge ATUM CREA | Sources: Supabase Storage docs, pingdotgg/uploadthing, AWS SDK v3*
