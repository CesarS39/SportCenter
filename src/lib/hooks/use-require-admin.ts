import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from './use-require-auth'
import { useProfile } from './use-profile'

export function useRequireAdmin() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useRequireAuth()
  const { data: profile, isFetched, isLoading: isProfileLoading } = useProfile()

  const isAdmin = profile?.role === 'ADMIN'

  useEffect(() => {
    if (isFetched && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isFetched, isAdmin, router])

  return { user, profile, isLoading: isUserLoading || isProfileLoading || !isAdmin }
}
