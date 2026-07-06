import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export interface SportType {
  id: string
  name: string
  description: string | null
  maxPeople: number
}

export function useSportTypes(enabled = true) {
  return useQuery({
    queryKey: ['sport-types'],
    queryFn: () => apiFetch<{ sportTypes: SportType[] }>('/api/sport-types').then((r) => r.sportTypes),
    enabled,
  })
}
