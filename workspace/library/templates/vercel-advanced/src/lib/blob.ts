/**
 * Vercel Blob Storage Utilities
 * @module lib/blob
 *
 * Usage via Claude Code (langage naturel):
 * - "Upload un fichier vers le blob storage"
 * - "Liste tous les fichiers uploadés"
 * - "Supprime le fichier avatar.png"
 */

import { put, list, del, head, copy } from '@vercel/blob';

// Types
export interface UploadOptions {
  access?: 'public' | 'private';
  contentType?: string;
  addRandomSuffix?: boolean;
  multipart?: boolean;
}

export interface BlobFile {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}

// Validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'application/json',
  'video/mp4', 'audio/mpeg'
];

/**
 * Upload un fichier vers Vercel Blob
 */
export async function uploadFile(
  file: File | Buffer,
  pathname: string,
  options: UploadOptions = {}
): Promise<BlobFile> {
  // Validation taille
  const size = file instanceof File ? file.size : file.length;
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${size} bytes (max: ${MAX_FILE_SIZE})`);
  }

  // Validation type
  if (file instanceof File && !ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }

  const blob = await put(pathname, file, {
    access: options.access ?? 'public',
    contentType: options.contentType ?? (file instanceof File ? file.type : undefined),
    addRandomSuffix: options.addRandomSuffix ?? false,
    multipart: options.multipart ?? size > 4 * 1024 * 1024, // Auto multipart > 4MB
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType ?? 'application/octet-stream',
    size,
    uploadedAt: new Date(),
  };
}

/**
 * Upload fichier utilisateur avec chemin sécurisé
 */
export async function uploadUserFile(
  file: File,
  userId: string,
  folder: string = 'uploads'
): Promise<BlobFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `${folder}/${userId}/${timestamp}-${safeName}`;

  return uploadFile(file, pathname);
}

/**
 * Liste les fichiers avec pagination
 */
export async function listFiles(
  prefix?: string,
  limit: number = 100
): Promise<{ files: BlobFile[]; hasMore: boolean; cursor?: string }> {
  const result = await list({
    prefix,
    limit,
  });

  return {
    files: result.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType ?? 'application/octet-stream',
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
    })),
    hasMore: result.hasMore,
    cursor: result.cursor,
  };
}

/**
 * Supprime un ou plusieurs fichiers
 */
export async function deleteFiles(pathnames: string | string[]): Promise<void> {
  const paths = Array.isArray(pathnames) ? pathnames : [pathnames];
  await del(paths);
}

/**
 * Copie un fichier
 */
export async function copyFile(from: string, to: string): Promise<BlobFile> {
  const result = await copy(from, to);
  const info = await head(to);

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: info?.contentType ?? 'application/octet-stream',
    size: info?.size ?? 0,
    uploadedAt: new Date(),
  };
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(pathname: string): Promise<boolean> {
  try {
    const info = await head(pathname);
    return info !== null;
  } catch {
    return false;
  }
}

/**
 * Récupère les métadonnées d'un fichier
 */
export async function getFileInfo(pathname: string): Promise<BlobFile | null> {
  try {
    const info = await head(pathname);
    if (!info) return null;

    return {
      url: info.url,
      pathname: info.pathname,
      contentType: info.contentType ?? 'application/octet-stream',
      size: info.size,
      uploadedAt: new Date(info.uploadedAt),
    };
  } catch {
    return null;
  }
}
