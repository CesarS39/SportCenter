import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utilidades para fechas
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(time: string): string {
  return time.slice(0, 5) // "14:30:00" -> "14:30"
}

// Validaciones de horarios
export const OPERATING_HOURS = {
  monday: { start: '07:00', end: '21:00' },
  tuesday: { start: '07:00', end: '21:00' },
  wednesday: { start: '07:00', end: '21:00' },
  thursday: { start: '07:00', end: '21:00' },
  friday: { start: '07:00', end: '21:00' },
  saturday: { start: '09:00', end: '14:00' },
  sunday: { start: '09:00', end: '12:00' }
}

export function isOperatingDay(date: Date): boolean {
  const day = date.getDay() // 0 = domingo, 6 = sábado
  return day >= 0 && day <= 6 // Todos los días están abiertos
}

export function getOperatingHours(date: Date): { start: string; end: string } {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayName = days[date.getDay()] as keyof typeof OPERATING_HOURS
  return OPERATING_HOURS[dayName]
}

// Generar horarios disponibles
export function generateTimeSlots(startTime: string, endTime: string, duration: number = 60): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  while (start < end) {
    slots.push(start.toTimeString().slice(0, 5))
    start.setMinutes(start.getMinutes() + duration)
  }
  
  return slots
}