import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export interface FitnessClass {
  id: string
  name: string
  instructor: string
  duration: number
  level: 'beginner' | 'intermediate' | 'advanced'
  time: string
  day: string
  spots: number
  maxSpots: number
  category: 'cardio' | 'strength' | 'yoga' | 'hiit' | 'cycling'
}

export interface Membership {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  features: string[]
  popular?: boolean
}
