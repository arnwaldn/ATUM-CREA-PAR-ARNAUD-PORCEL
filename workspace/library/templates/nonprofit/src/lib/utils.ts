import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Campaign {
  id: string
  title: string
  description: string
  image: string
  goal: number
  raised: number
  donors: number
  daysLeft: number
  category: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  location: string
  image: string
  type: 'fundraiser' | 'volunteer' | 'awareness'
}

export interface ImpactStat {
  value: number
  label: string
  suffix?: string
}

export interface Volunteer {
  id: string
  name: string
  role: string
  hours: number
  image: string
}

export interface DonationTier {
  amount: number
  label: string
  impact: string
}

export function formatCurrency(amount: number): string {
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

export function calculateProgress(raised: number, goal: number): number {
  return Math.min(Math.round((raised / goal) * 100), 100)
}
