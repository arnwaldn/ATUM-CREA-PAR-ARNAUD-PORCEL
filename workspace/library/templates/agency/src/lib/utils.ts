import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  features: string[]
}

export interface CaseStudy {
  id: string
  title: string
  client: string
  category: string
  description: string
  image: string
  results: { label: string; value: string }[]
  tags: string[]
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  image: string
  social: {
    linkedin?: string
    twitter?: string
  }
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  period: string
  features: string[]
  popular?: boolean
}
