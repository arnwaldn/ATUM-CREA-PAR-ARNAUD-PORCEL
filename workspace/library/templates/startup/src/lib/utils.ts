import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface PricingTier {
  id: string
  name: string
  description: string
  price: number | 'custom'
  period: string
  features: string[]
  cta: string
  popular?: boolean
}

export interface Testimonial {
  id: string
  content: string
  author: string
  role: string
  company: string
  avatar: string
}

export interface Stat {
  label: string
  value: string
  suffix?: string
}

export interface FAQ {
  question: string
  answer: string
}
