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

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export interface Room {
  id: string
  name: string
  type: 'standard' | 'deluxe' | 'suite' | 'presidential'
  price: number
  capacity: number
  size: number
  amenities: string[]
  images: string[]
  available: boolean
}

export interface Booking {
  roomId: string
  checkIn: Date
  checkOut: Date
  guests: number
  totalPrice: number
}
