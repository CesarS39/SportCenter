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
  Plus
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
        return total + (reservation.court?.price_per_hour || 0)
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
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando panel de administración...</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">SportCenter Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Vista Usuario</Link>
              </Button>
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
              <AvatarFallback className="bg-red-100 text-red-600 text-xl font-semibold">
                {profile?.name 
                  ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'A'
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                ¡Hola, {profile?.name || 'Administrador'}! 👨‍💼
              </h2>
              <p className="text-gray-600">Bienvenido al panel de administración</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/admin/canchas">
                <MapPin className="h-4 w-4 mr-2" />
                Gestionar Canchas
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/reservas">Ver Todas las Reservas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/usuarios">Gestionar Usuarios</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Canchas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Total</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.revenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reservations */}
          <Card>
            <CardHeader>
              <CardTitle>Reservas Recientes</CardTitle>
              <CardDescription>
                Últimas reservas realizadas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getSportIcon(reservation.court.sport_type.name)}
                      </div>
                      <div>
                        <p className="font-medium">{reservation.court.name}</p>
                        <p className="text-sm text-gray-600">
                          {reservation.user.name} • {formatDate(new Date(reservation.date))} • {formatTime(reservation.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(reservation.status, reservation.penalty_applied)}
                      {reservation.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/reservas">Ver todas las reservas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Recientes</CardTitle>
              <CardDescription>
                Últimos usuarios registrados
              </CardDescription>
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
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {user.phone || 'Sin teléfono'} • {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/usuarios">Ver todos los usuarios</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}