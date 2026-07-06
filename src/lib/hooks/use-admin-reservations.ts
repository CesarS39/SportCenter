import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Reservation } from './use-reservations'

export function useAdminReservations(enabled = true) {
  return useQuery({
    queryKey: ['admin-all-reservations'],
    queryFn: () =>
      apiFetch<{ reservations: Reservation[] }>('/api/admin/reservations').then((r) => r.reservations),
    enabled,
  })
}

export function useAdminReservationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-all-reservations'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const cancelReservation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ reservation: Reservation }>(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'cancel' }),
      }),
    onSuccess: invalidate,
  })

  const completeReservation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ reservation: Reservation }>(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'complete' }),
      }),
    onSuccess: invalidate,
  })

  return { cancelReservation, completeReservation }
}
