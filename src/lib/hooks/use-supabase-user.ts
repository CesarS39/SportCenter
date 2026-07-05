import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useSupabaseUser() {
  return useQuery({
    queryKey: ['supabase-user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user
    },
  })
}
