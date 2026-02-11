import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  image: string
  github?: string
  demo?: string
  featured: boolean
}

export interface Skill {
  name: string
  level: number
  category: 'frontend' | 'backend' | 'tools' | 'design'
}

export interface Experience {
  company: string
  role: string
  period: string
  description: string
  current?: boolean
}
