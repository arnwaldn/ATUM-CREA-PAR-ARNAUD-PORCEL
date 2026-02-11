import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Photo {
  id: string
  src: string
  alt: string
  width: number
  height: number
  category: string
  title?: string
  date?: Date
}

export interface Gallery {
  id: string
  name: string
  slug: string
  cover: string
  photos: Photo[]
  description?: string
}

export const categories = [
  'portrait',
  'wedding',
  'landscape',
  'fashion',
  'product',
  'event',
] as const

export type Category = typeof categories[number]
