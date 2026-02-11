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
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatArea(sqm: number): string {
  return `${sqm} m²`
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'loft'
export type TransactionType = 'sale' | 'rent'

export interface Property {
  id: string
  title: string
  type: PropertyType
  transaction: TransactionType
  price: number
  area: number
  rooms: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
  zipCode: string
  description: string
  features: string[]
  images: string[]
  coordinates: { lat: number; lng: number }
  createdAt: Date
}
