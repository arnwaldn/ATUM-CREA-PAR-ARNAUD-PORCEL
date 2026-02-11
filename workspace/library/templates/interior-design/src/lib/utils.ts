import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Project {
  id: string
  title: string
  category: string
  location: string
  year: number
  description: string
  images: { before: string; after: string }[]
  featured: boolean
}

export interface Service {
  title: string
  description: string
  icon: string
}

export type ProjectCategory = 'residential' | 'commercial' | 'hospitality' | 'retail'
