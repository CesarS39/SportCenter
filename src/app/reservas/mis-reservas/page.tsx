'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle, 
  AlertCircle,
  Plus
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

interface Reservation {
  id: string
  date: string
  start_time: string
  end_time: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
  penalty_applied: boolean
  created_at: string
  court: {
    id: string
    name: string
    price_per_hour: number
    sport_type: {
      name: string
    }
  }
}

export default function MisReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserReservations()
  }, [])

  const loadUserReservations = async () => {
    try {
      // Verificar usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Obtener todas las reservas del usuario
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          court:courts (
            id,
            name,
            price_per_hour,
            sport_type:sport_types (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (reservationsError) {
        console.error('Error loading reservations:', reservationsError)
        toast.error('Error al cargar las reservas')
      } else {
        setReservations(reservationsData || [])
      }
    } catch (error) {
      console.error('Error loading user reservations:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const canCancelReservation = (reservation: Reservation): boolean => {
    if (reservation.status !== 'ACTIVE') return false
    
    const now = new Date()
    const reservationDateTime = new Date(`${reservation.date}T${reservation.start_time}`)
    const hoursUntilReservation = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return hoursUntilReservation >= 2 // Mínimo 2 horas antes
  }

  const getTimeUntilCancellation = (reservation: Reservation): string => {
    const now = new Date()
    const reservationDateTime = new Date(`${reservation.date}T${reservation.start_time}`)
    const hoursUntilReservation = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilReservation < 2) {
      return 'No se puede cancelar (menos de 2 horas)'
    }
    
    const hours = Math.floor(hoursUntilReservation)
    const minutes = Math.floor((hoursUntilReservation - hours) * 60)
    
    return `Se puede cancelar por ${hours}h ${minutes}m más`
  }

  const handleCancelReservation = async (reservationId: string) => {
    setCancellingId(reservationId)
    
    const loadingToast = toast.loading('Cancelando reserva...', {
      description: 'Por favor espera un momento'
    })

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'CANCELLED',
          penalty_applied: true // Aplicar penalización por cancelación
        })
        .eq('id', reservationId)

      toast.dismiss(loadingToast)

      if (error) {
        console.error('Error cancelling reservation:', error)
        toast.error('Error al cancelar la reserva', {
          description: error.message
        })
        return
      }

      toast.success('Reserva cancelada exitosamente', {
        description: 'Se ha aplicado una penalización por cancelación'
      })

      // Recargar las reservas
      await loadUserReservations()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error cancelling reservation:', error)
      toast.error('Error inesperado al cancelar la reserva')
    } finally {
      setCancellingId(null)
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

  // Filtrar reservas por estado
  const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
  const pastReservations = reservations.filter(r => r.status !== 'ACTIVE')
  const upcomingReservations = activeReservations.filter(r => new Date(`${r.date}T${r.start_time}`) > new Date())
  const todayReservations = activeReservations.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.date === today
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando tus reservas...</p>
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
              <Button variant="ghost" asChild className="mr-4">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
            </div>
            <Button asChild>
              <Link href="/reservas">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{activeReservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{todayReservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Próximas</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingReservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Reservas</CardTitle>
            <CardDescription>
              Gestiona y revisa todas tus reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Activas ({activeReservations.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas ({upcomingReservations.length})</TabsTrigger>
                <TabsTrigger value="past">Historial ({pastReservations.length})</TabsTrigger>
              </TabsList>

              {/* Reservas Activas */}
              <TabsContent value="active" className="space-y-4">
                {activeReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas activas</h3>
                    <p className="text-gray-600 mb-4">¡Haz una nueva reserva para disfrutar de nuestras canchas!</p>
                    <Button asChild>
                      <Link href="/reservas">Hacer Reserva</Link>
                    </Button>
                  </div>
                ) : (
                  activeReservations.map((reservation) => (
                    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">
                              {getSportIcon(reservation.court.sport_type.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{reservation.court.name}</h3>
                                <Badge variant="outline">{reservation.court.sport_type.name}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {formatDate(new Date(reservation.date))}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {getTimeUntilCancellation(reservation)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.status, reservation.penalty_applied)}
                            {canCancelReservation(reservation) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelReservation(reservation.id)}
                                disabled={cancellingId === reservation.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                {cancellingId === reservation.id ? 'Cancelando...' : 'Cancelar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Próximas Reservas */}
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes próximas reservas</h3>
                    <p className="text-gray-600">Todas tus reservas activas son para hoy o fechas pasadas.</p>
                  </div>
                ) : (
                  upcomingReservations.map((reservation) => (
                    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">
                              {getSportIcon(reservation.court.sport_type.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{reservation.court.name}</h3>
                                <Badge variant="outline">{reservation.court.sport_type.name}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {formatDate(new Date(reservation.date))}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.status, reservation.penalty_applied)}
                            {canCancelReservation(reservation) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelReservation(reservation.id)}
                                disabled={cancellingId === reservation.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                {cancellingId === reservation.id ? 'Cancelando...' : 'Cancelar'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Historial */}
              <TabsContent value="past" className="space-y-4">
                {pastReservations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial aún</h3>
                    <p className="text-gray-600">Aquí aparecerán tus reservas completadas y canceladas.</p>
                  </div>
                ) : (
                  pastReservations.map((reservation) => (
                    <Card key={reservation.id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl grayscale">
                              {getSportIcon(reservation.court.sport_type.name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{reservation.court.name}</h3>
                                <Badge variant="outline">{reservation.court.sport_type.name}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-4 w-4" />
                                  {formatDate(new Date(reservation.date))}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Precio pagado: ${reservation.court.price_per_hour}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {getStatusBadge(reservation.status, reservation.penalty_applied)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info sobre cancelaciones */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Política de cancelación:</strong> Las reservas pueden cancelarse hasta 2 horas antes del horario reservado. 
            Las cancelaciones aplican una penalización automática.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  )
}