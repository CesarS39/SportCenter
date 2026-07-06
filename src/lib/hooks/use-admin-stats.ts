import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { Reservation } from './use-reservations'

export interface AdminStats {
  totalReservations: number
  activeReservations: number
  totalCourts: number
  totalUsers: number
  todayReservations: number
  revenue: number
}

export interface RecentUser {
  id: string
  userId: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export function useAdminStats(enabled = true) {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () =>
      apiFetch<{ stats: AdminStats; recentReservations: Reservation[]; recentUsers: RecentUser[] }>(
        '/api/admin/stats'
      ),
    enabled,
  })
}
