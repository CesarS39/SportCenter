import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export interface AdminUser {
  id: string
  userId: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
  totalReservations: number
  activeReservations: number
  completedReservations: number
  cancelledReservations: number
  lastActivity: string | null
}

export interface UserFormInput {
  name: string
  phone: string
  role: 'USER' | 'ADMIN'
}

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ['admin-users-with-stats'],
    queryFn: () => apiFetch<{ users: AdminUser[] }>('/api/admin/users').then((r) => r.users),
    enabled,
  })
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] })

  const updateUser = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserFormInput }) =>
      apiFetch<{ user: AdminUser }>(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: invalidate,
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => apiFetch<{ success: true }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  const toggleRole = useMutation({
    mutationFn: (id: string) => apiFetch<{ user: AdminUser }>(`/api/admin/users/${id}/role`, { method: 'PATCH' }),
    onSuccess: invalidate,
  })

  return { updateUser, deleteUser, toggleRole }
}
