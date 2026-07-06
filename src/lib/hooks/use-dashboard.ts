import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Profile } from './use-profile'
import { useSupabaseUser } from './use-supabase-user'

export interface DashboardReservation {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
  court: {
    id: string
    name: string
    sportType: { name: string }
  }
}

export function useDashboard() {
  const { data: user } = useSupabaseUser()

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () =>
      apiFetch<{ profile: Profile; reservations: DashboardReservation[] }>('/api/dashboard'),
    enabled: !!user,
  })
}
