import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseUser } from './use-supabase-user'

export function useRequireAuth() {
  const router = useRouter()
  const { data: user, isLoading, isFetched } = useSupabaseUser()

  useEffect(() => {
    if (isFetched && !user) {
      router.push('/auth/login')
    }
  }, [isFetched, user, router])

  return { user, isLoading: isLoading || !user }
}
