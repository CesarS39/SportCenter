import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { SportType } from './use-sport-types'

export interface Court {
  id: string
  name: string
  sportTypeId: string
  pricePerHour: number
  maxPeople: number
  imageUrl: string | null
  active: boolean
  createdAt: string
  sportType: SportType
}

export interface CourtFormInput {
  name: string
  sportTypeId: string
  pricePerHour: number
  maxPeople: number
  imageUrl?: string | null
}

export function useCourts(enabled = true) {
  return useQuery({
    queryKey: ['courts'],
    queryFn: () => apiFetch<{ courts: Court[] }>('/api/courts').then((r) => r.courts),
    enabled,
  })
}

export function useAdminCourts(enabled = true) {
  return useQuery({
    queryKey: ['admin-courts'],
    queryFn: () => apiFetch<{ courts: Court[] }>('/api/admin/courts').then((r) => r.courts),
    enabled,
  })
}

export function useCourtAvailability(courtId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['court-availability', courtId, date],
    queryFn: () =>
      apiFetch<{ reservations: { id: string; startTime: string; endTime: string }[] }>(
        `/api/courts/${courtId}/availability?date=${date}`
      ).then((r) => r.reservations),
    enabled: !!courtId && !!date,
  })
}

export function groupCourtsBySport(courts: Court[]) {
  return courts.reduce((acc, court) => {
    const sportTypeId = court.sportType.id
    if (!acc[sportTypeId]) {
      acc[sportTypeId] = { sportType: court.sportType, courts: [] }
    }
    acc[sportTypeId].courts.push(court)
    return acc
  }, {} as Record<string, { sportType: SportType; courts: Court[] }>)
}

export function computeAvailableSlots(
  allSlots: string[],
  existingReservations: { startTime: string; endTime: string }[]
): string[] {
  const occupiedSlots = new Set<string>()

  existingReservations.forEach((reservation) => {
    const startIndex = allSlots.indexOf(reservation.startTime.slice(0, 5))
    const endIndex = allSlots.indexOf(reservation.endTime.slice(0, 5))
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= 0 && i < allSlots.length) occupiedSlots.add(allSlots[i])
    }
  })

  return allSlots.filter((slot) => !occupiedSlots.has(slot))
}

export function canSelectContiguousSlot(
  allSlots: string[],
  availableSlots: string[],
  slot: string,
  duration: number
): boolean {
  const slotIndex = allSlots.indexOf(slot)
  if (slotIndex === -1 || !availableSlots.includes(slot)) return false

  for (let i = 0; i < duration; i++) {
    const nextSlotIndex = slotIndex + i
    if (nextSlotIndex >= allSlots.length) return false
    if (!availableSlots.includes(allSlots[nextSlotIndex])) return false
  }
  return true
}

export function useAdminCourtMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-courts'] })

  const createCourt = useMutation({
    mutationFn: (input: CourtFormInput) =>
      apiFetch<{ court: Court }>('/api/admin/courts', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: invalidate,
  })

  const updateCourt = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CourtFormInput }) =>
      apiFetch<{ court: Court }>(`/api/admin/courts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: invalidate,
  })

  const toggleActive = useMutation({
    mutationFn: (id: string) => apiFetch<{ court: Court }>(`/api/admin/courts/${id}/toggle`, { method: 'PATCH' }),
    onSuccess: invalidate,
  })

  const deleteCourt = useMutation({
    mutationFn: (id: string) => apiFetch<{ success: true }>(`/api/admin/courts/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return { createCourt, updateCourt, toggleActive, deleteCourt }
}
