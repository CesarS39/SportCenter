import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { useSupabaseUser } from './use-supabase-user'

export interface ReservationCourt {
  id: string
  name: string
  pricePerHour: number
  sportType: { name: string }
}

export interface ReservationUser {
  name: string
  phone: string | null
  userId: string
}

export interface Reservation {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
  penaltyApplied: boolean
  createdAt: string
  court: ReservationCourt
  user: ReservationUser
}

export interface CreateReservationInput {
  courtId: string
  date: string
  startTime: string
  endTime: string
}

export function validateAdvanceBooking(date: Date): string | null {
  const hoursDifference = (date.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursDifference < 24) {
    return 'Debes reservar con al menos 24 horas de anticipación'
  }
  return null
}

export function computeEndTime(startTimeSlot: string, durationHours: number): string {
  const [startHour, startMinute] = startTimeSlot.split(':').map(Number)
  const endHour = startHour + durationHours
  return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
}

export function useMyReservations() {
  const { data: user } = useSupabaseUser()

  return useQuery({
    queryKey: ['user-reservations', user?.id],
    queryFn: () => apiFetch<{ reservations: Reservation[] }>('/api/reservations').then((r) => r.reservations),
    enabled: !!user,
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReservationInput) =>
      apiFetch<{ reservation: Reservation }>('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['court-availability', vars.courtId, vars.date] })
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] })
    },
  })
}

export function useCancelMyReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) =>
      apiFetch<{ reservation: Reservation }>(`/api/reservations/${reservationId}`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reservations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
