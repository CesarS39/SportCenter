'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Trophy, 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Settings, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
  Plus,
  Menu,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

interface AdminStats {
  totalReservations: number
  activeReservations: number
  totalCourts: number
  totalUsers: number
  todayReservations: number
  revenue: number
}

interface Reservation {
  id: string
  date: string
  start_time: string
  end_time: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
  penalty_applied: boolean
  created_at: string
  user: {
    name: string
    phone: string | null
  }
  court: {
    id: string
    name: string
    price_per_hour: number
    sport_type: {
      name: string
    }
  }
}

interface User {
  id: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  created_at: string
  user_id: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalReservations: 0,
    activeReservations: 0,
    totalCourts: 0,
    totalUsers: 0,
    todayReservations: 0,
    revenue: 0
  })
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([])
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Verificar usuario y permisos de admin
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Verificar rol de admin
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || profileData?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      setProfile(profileData)

      // Cargar estadísticas
      await Promise.all([
        loadStats(),
        loadRecentReservations(),
        loadRecentUsers()
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Error al cargar los datos del panel')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Total de reservas
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })

      // Reservas activas
      const { count: activeReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')

      // Total de canchas
      const { count: totalCourts } = await supabase
        .from('courts')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

      // Total de usuarios
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Reservas de hoy
      const today = new Date().toISOString().split('T')[0]
      const { count: todayReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'ACTIVE')

      // Calcular ingresos (reservas completadas)
      const { data: completedReservations } = await supabase
        .from('reservations')
        .select(`
          id,
          court:courts (
            price_per_hour
          )
        `)
        .eq('status', 'COMPLETED')

      const revenue = completedReservations?.reduce((total, reservation) => {
        if (reservation.court && typeof reservation.court === 'object' && 'price_per_hour' in reservation.court) {
          const court = reservation.court as { price_per_hour: number }
          return total + (court.price_per_hour || 0)
        }
        return total
      }, 0) || 0

      setStats({
        totalReservations: totalReservations || 0,
        activeReservations: activeReservations || 0,
        totalCourts: totalCourts || 0,
        totalUsers: totalUsers || 0,
        todayReservations: todayReservations || 0,
        revenue
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentReservations = async () => {
    try {
      const { data: reservationsData, error } = await supabase
        .from('reservations')
        .select(`
          *,
          user:user_profiles (
            name,
            phone
          ),
          court:courts (
            id,
            name,
            price_per_hour,
            sport_type:sport_types (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading recent reservations:', error)
      } else {
        setRecentReservations(reservationsData || [])
      }
    } catch (error) {
      console.error('Error loading recent reservations:', error)
    }
  }

  const loadRecentUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading recent users:', error)
      } else {
        setRecentUsers(usersData || [])
      }
    } catch (error) {
      console.error('Error loading recent users:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCancelReservation = async (reservationId: string) => {
    const loadingToast = toast.loading('Cancelando reserva...', {
      description: 'Cancelación administrativa'
    })

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'CANCELLED_ADMIN',
          penalty_applied: false // Admin no aplica penalización
        })
        .eq('id', reservationId)

      toast.dismiss(loadingToast)

      if (error) {
        toast.error('Error al cancelar la reserva', {
          description: error.message
        })
        return
      }

      toast.success('Reserva cancelada por administración', {
        description: 'Sin penalización para el usuario'
      })

      // Recargar datos
      await Promise.all([loadStats(), loadRecentReservations()])
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error cancelling reservation:', error)
      toast.error('Error inesperado al cancelar la reserva')
    }
  }

  const getStatusBadge = (status: string, penaltyApplied: boolean = false) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: penaltyApplied 
        ? 'bg-red-100 text-red-800 border-red-200' 
        : 'bg-orange-100 text-orange-800 border-orange-200',
      CANCELLED_ADMIN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    const labels = {
      ACTIVE: 'Activa',
      CANCELLED: penaltyApplied ? 'Cancelada (Con penalización)' : 'Cancelada',
      CANCELLED_ADMIN: 'Cancelada por Admin',
      COMPLETED: 'Completada'
    }

    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} text-xs flex-shrink-0`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getSportIcon = (sportName: string) => {
    const icons = {
      'Tenis': '🎾',
      'Pádel': '🏓',
      'Fútbol': '⚽'
    }
    return icons[sportName as keyof typeof icons] || '🏟️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Sticky y optimizado */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-0 flex-1">
              <Trophy className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">Panel Admin</h1>
                <p className="text-xs text-gray-600 hidden sm:block">SportCenter Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link href="/dashboard">Vista Usuario</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Welcome Section - Mobile optimized */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
              <AvatarFallback className="bg-red-100 text-red-600 text-lg font-semibold">
                {profile?.name 
                  ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'A'
                }
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                ¡Hola, {profile?.name?.split(' ')[0] || 'Admin'}! 👨‍💼
              </h2>
              <p className="text-sm text-gray-600">Bienvenido al panel de administración</p>
            </div>
          </div>

          {/* Quick Actions - Mobile stacked, desktop inline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button asChild className="h-12 text-sm">
              <Link href="/admin/canchas">
                <MapPin className="h-4 w-4 mr-2" />
                Gestionar Canchas
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12 text-sm">
              <Link href="/admin/reservas">Ver Reservas</Link>
            </Button>
            <Button variant="outline" asChild className="h-12 text-sm">
              <Link href="/admin/usuarios">Gestionar Usuarios</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.activeReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Canchas</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalCourts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Hoy</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">${stats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Mobile tabs, desktop grid */}
        <div className="lg:hidden">
          {/* Mobile: Tabs */}
          <Tabs defaultValue="reservations" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="reservations" className="text-xs">Reservas Recientes</TabsTrigger>
              <TabsTrigger value="users" className="text-xs">Usuarios Recientes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Reservas Recientes</CardTitle>
                      <CardDescription className="text-sm">
                        Últimas reservas realizadas
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/reservas">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentReservations.slice(0, 5).map((reservation) => (
                      <Card key={reservation.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-xl flex-shrink-0">
                              {getSportIcon(reservation.court.sport_type.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm truncate">{reservation.court.name}</h3>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {reservation.court.sport_type.name}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{reservation.user.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{formatDate(new Date(reservation.date))}</span>
                                <span>•</span>
                                <span>{formatTime(reservation.start_time)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(reservation.status, reservation.penalty_applied)}
                              {reservation.status === 'ACTIVE' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="mx-4">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm">
                                        Se cancelará la reserva de {reservation.user.name} sin penalización.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col gap-2">
                                      <AlertDialogCancel className="w-full">Mantener</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        className="bg-red-600 hover:bg-red-700 w-full"
                                      >
                                        Cancelar reserva
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Usuarios Recientes</CardTitle>
                      <CardDescription className="text-sm">
                        Últimos usuarios registrados
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/admin/usuarios">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((user) => (
                      <Card key={user.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-600 truncate">
                                {user.phone || 'Sin teléfono'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(user.created_at).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                              {user.role}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Recent Reservations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reservas Recientes</CardTitle>
                  <CardDescription>
                    Últimas reservas realizadas en el sistema
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/reservas">
                    Ver todas <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-2xl flex-shrink-0">
                        {getSportIcon(reservation.court.sport_type.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{reservation.court.name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {reservation.user.name} • {formatDate(new Date(reservation.date))} • {formatTime(reservation.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(reservation.status, reservation.penalty_applied)}
                      {reservation.status === 'ACTIVE' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se cancelará la reserva de {reservation.user.name} sin penalización para el usuario.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelReservation(reservation.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Cancelar reserva
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuarios Recientes</CardTitle>
                  <CardDescription>
                    Últimos usuarios registrados
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/usuarios">
                    Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {user.phone || 'Sin teléfono'} • {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}