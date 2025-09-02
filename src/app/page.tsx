'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Calendar, Clock, MapPin, Plus, User, LogOut, Trophy, Menu, Bell, Settings } from 'lucide-react'
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

export default function DashboardPageMobile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
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
      <Badge className={`${styles[status as keyof typeof styles]} text-xs px-1.5 py-0.5`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getSportIcon = (sportName: string) => {
    const icons: { [key: string]: string } = {
      'Tenis': '🎾',
      'Pádel': '🏓',
      'Fútbol': '⚽'
    }
    return icons[sportName] || '🏟️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Sticky */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-0 flex-1">
              <Trophy className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
              <h1 className="text-lg font-bold text-gray-900">SportCenter</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notificaciones (placeholder) */}
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* Menu lateral */}
              <Sheet open={showMenu} onOpenChange={setShowMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-green-100 text-green-600 text-lg font-semibold">
                          {profile?.name 
                            ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : 'U'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <SheetTitle className="text-left">{profile?.name || 'Usuario'}</SheetTitle>
                        <SheetDescription className="text-left">
                          {profile?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    {/* Navegación */}
                    <div className="space-y-2">
                      <Button variant="ghost" asChild className="w-full justify-start h-12">
                        <Link href="/reservas" onClick={() => setShowMenu(false)}>
                          <Plus className="h-5 w-5 mr-3" />
                          Nueva Reserva
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" asChild className="w-full justify-start h-12">
                        <Link href="/reservas/mis-reservas" onClick={() => setShowMenu(false)}>
                          <Calendar className="h-5 w-5 mr-3" />
                          Mis Reservas
                        </Link>
                      </Button>
                      
                      {profile?.role === 'ADMIN' && (
                        <Button variant="ghost" asChild className="w-full justify-start h-12">
                          <Link href="/admin" onClick={() => setShowMenu(false)}>
                            <Settings className="h-5 w-5 mr-3" />
                            Panel Admin
                          </Link>
                        </Button>
                      )}
                    </div>
                    
                    {/* Información del usuario */}
                    <div className="pt-4 border-t">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{profile?.phone || 'Sin teléfono'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Logout */}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={handleLogout} 
                        className="w-full justify-start h-12 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {/* Welcome Section - Optimizada para móvil */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarFallback className="bg-green-100 text-green-600 text-lg font-semibold">
                {profile?.name 
                  ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'U'
                }
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                ¡Hola, {profile?.name?.split(' ')[0] || 'Usuario'}! 👋
              </h2>
              <p className="text-gray-600 text-sm">Bienvenido a tu panel de reservas</p>
            </div>
          </div>

          {/* Quick Actions - Botones apilados en móvil */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <Button asChild className="w-full sm:flex-1 sm:max-w-xs h-12">
              <Link href="/reservas">
                <Plus className="h-5 w-5 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto h-12">
              <Link href="/reservas/mis-reservas">Ver Todas mis Reservas</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600 flex-shrink-0" />
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
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600 flex-shrink-0" />
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
            <CardContent className="p-4">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600 flex-shrink-0" />
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

        {/* Próximas Reservas - Cards optimizadas para móvil */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Próximas Reservas</CardTitle>
                <CardDescription className="text-sm">
                  Tus reservas activas próximas
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reservas/mis-reservas">Ver todas</Link>
              </Button>
            </div>
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
              <div className="space-y-3">
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
                      <Card key={reservation.id} className={`border shadow-sm ${isToday ? 'bg-green-50 border-green-200' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0">
                              {getSportIcon(reservation.court.sport_type.name)}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold truncate">{reservation.court.name}</h3>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {reservation.court.sport_type.name}
                                </Badge>
                                {isToday && (
                                  <Badge className="bg-green-600 text-white text-xs">HOY</Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 flex-shrink-0" />
                                  <span className="font-medium">
                                    {dateLabel}
                                    {!isToday && !isTomorrow && (
                                      <span className="text-xs font-normal text-gray-500 ml-1">
                                        ({reservationDate.toLocaleDateString('es-ES', { weekday: 'short' })})
                                      </span>
                                    )}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 flex-shrink-0" />
                                  <span>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {getStatusBadge(reservation.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
      
      {/* Floating Action Button para móvil */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button asChild size="lg" className="rounded-full shadow-lg h-14 w-14 p-0">
          <Link href="/reservas">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  )
}