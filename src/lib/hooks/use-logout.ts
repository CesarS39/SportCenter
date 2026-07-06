import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function useLogout() {
  const router = useRouter()

  return async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
}
