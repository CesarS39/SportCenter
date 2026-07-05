import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useRequireAuth } from './use-require-auth'

interface AdminProfile {
  id: string
  user_id: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
}

export function useRequireAdmin() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useRequireAuth()

  const { data: profile, isFetched, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error) throw error
      return data as AdminProfile
    },
    enabled: !!user,
  })

  const isAdmin = profile?.role === 'ADMIN'

  useEffect(() => {
    if (isFetched && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isFetched, isAdmin, router])

  return { user, profile, isLoading: isUserLoading || isProfileLoading || !isAdmin }
}
