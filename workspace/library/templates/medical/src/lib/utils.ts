import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  avatar: string
  available: boolean
  nextSlot?: Date
}

export interface Appointment {
  id: string
  doctorId: string
  patientName: string
  date: Date
  duration: number
  type: 'consultation' | 'followup' | 'teleconsultation'
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface TimeSlot {
  time: string
  available: boolean
}
