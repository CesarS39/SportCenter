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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'courts_sport_type_id_fkey'
            columns: ['sport_type_id']
            isOneToOne: false
            referencedRelation: 'sport_types'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'reservations_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['user_id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
