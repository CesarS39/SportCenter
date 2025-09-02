import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export type Database = {
  public: {
    Tables: {
      sport_types: {
        Row: {
          id: string
          name: string
          description: string | null
          max_people: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          max_people: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          max_people?: number
          created_at?: string
        }
      }
      courts: {
        Row: {
          id: string
          name: string
          sport_type_id: string
          price_per_hour: number
          max_people: number
          image_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sport_type_id: string
          price_per_hour: number
          max_people: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sport_type_id?: string
          price_per_hour?: number
          max_people?: number
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          role: 'USER' | 'ADMIN'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          role?: 'USER' | 'ADMIN'
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
          penalty_applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          court_id: string
          date: string
          start_time: string
          end_time: string
          status?: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
          penalty_applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          court_id?: string
          date?: string
          start_time?: string
          end_time?: string
          status?: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
          penalty_applied?: boolean
          created_at?: string
        }
      }
    }
  }
}