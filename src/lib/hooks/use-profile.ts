import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { useSupabaseUser } from './use-supabase-user'

export interface Profile {
  id: string
  userId: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export function useProfile() {
  const { data: user } = useSupabaseUser()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => apiFetch<{ profile: Profile }>('/api/profile').then((r) => r.profile),
    enabled: !!user,
  })
}
