'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, Plus, User, LogOut, Trophy } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface UserProfile {
  id: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
}

interface Reservation {
  id: string
  date: string
  start_time: string
  end_time: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
  court: {
    id: string
    name: string
    sport_type: {
      name: string
    }
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Obtener perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
      } else {
        setProfile(profileData)
      }

      // Obtener reservas del usuario con filtro de fechas
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          court:courts (
            id,
            name,
            sport_type:sport_types (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0]) // Solo reservas de hoy en adelante
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (reservationsError) {
        console.error('Error loading reservations:', reservationsError)
      } else {
        setReservations(reservationsData || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      CANCELLED_ADMIN: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      ACTIVE: 'Activa',
      CANCELLED: 'Cancelada',
      CANCELLED_ADMIN: 'Cancelada por Admin',
      COMPLETED: 'Completada'
    }

    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SportCenter</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile?.role === 'ADMIN' && (
                <Button variant="outline" asChild>
                  <Link href="/admin">Panel Admin</Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-green-100 text-green-600 text-xl font-semibold">
                {profile?.name 
                  ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'U'
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                ¡Hola, {profile?.name || 'Usuario'}! 👋
              </h2>
              <p className="text-gray-600">Bienvenido a tu panel de reservas</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button asChild className="flex-1 max-w-xs">
              <Link href="/reservas">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/reservas/mis-reservas">Ver Todas mis Reservas</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => {
                      const today = new Date().toISOString().split('T')[0]
                      return r.date === today && r.status === 'ACTIVE'
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => {
                      const reservationDate = new Date(r.date)
                      const weekFromNow = new Date()
                      weekFromNow.setDate(weekFromNow.getDate() + 7)
                      return reservationDate <= weekFromNow && r.status === 'ACTIVE'
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
            <CardDescription>
              Tus reservas activas próximas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reservations.filter(r => r.status === 'ACTIVE').length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas activas</h3>
                <p className="text-gray-600 mb-4">¡Haz tu primera reserva y disfruta de nuestras canchas!</p>
                <Button asChild>
                  <Link href="/reservas">Hacer Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations
                  .filter(r => r.status === 'ACTIVE')
                  .slice(0, 5)
                  .map((reservation) => {
                    const reservationDate = new Date(reservation.date)
                    const today = new Date()
                    const isToday = reservationDate.toDateString() === today.toDateString()
                    const isTomorrow = reservationDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()
                    
                    let dateLabel = formatDate(reservationDate)
                    if (isToday) dateLabel = 'Hoy'
                    else if (isTomorrow) dateLabel = 'Mañana'
                    
                    return (
                      <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{reservation.court.name}</span>
                          </div>
                          <Badge variant="outline">
                            {reservation.court.sport_type.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {dateLabel}
                              {!isToday && !isTomorrow && (
                                <span className="text-sm font-normal text-gray-500 ml-1">
                                  ({reservationDate.toLocaleDateString('es-ES', { weekday: 'short' })})
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                      </div>
                    )
                  })}
                {reservations.filter(r => r.status === 'ACTIVE').length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/reservas/mis-reservas">Ver todas las reservas</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}