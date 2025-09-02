'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Trophy, 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User,
  Phone,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    user_id: string
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

interface FilterState {
  status: string
  sportType: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  searchTerm: string
}

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [sportTypes, setSportTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    sportType: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    searchTerm: ''
  })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reservations, filters])

  const loadData = async () => {
    try {
      // Verificar permisos de admin
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }

      // Cargar todas las reservas
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          user:user_profiles (
            name,
            phone,
            user_id
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
        .order('date', { ascending: false })
        .order('start_time', { ascending: false })

      if (reservationsError) {
        console.error('Error loading reservations:', reservationsError)
        toast.error('Error al cargar las reservas')
      } else {
        setReservations(reservationsData || [])
      }

      // Cargar tipos de deportes para filtros
      const { data: sportTypesData, error: sportTypesError } = await supabase
        .from('sport_types')
        .select('*')
        .order('name')

      if (sportTypesError) {
        console.error('Error loading sport types:', sportTypesError)
      } else {
        setSportTypes(sportTypesData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reservations]

    // Filtrar por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    // Filtrar por tipo de deporte
    if (filters.sportType !== 'all') {
      filtered = filtered.filter(r => r.court.sport_type.name === filters.sportType)
    }

    // Filtrar por rango de fechas
    if (filters.dateFrom) {
      const fromDate = filters.dateFrom.toISOString().split('T')[0]
      filtered = filtered.filter(r => r.date >= fromDate)
    }
    if (filters.dateTo) {
      const toDate = filters.dateTo.toISOString().split('T')[0]
      filtered = filtered.filter(r => r.date <= toDate)
    }

    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(r => 
        r.user.name.toLowerCase().includes(term) ||
        r.court.name.toLowerCase().includes(term) ||
        r.court.sport_type.name.toLowerCase().includes(term)
      )
    }

    setFilteredReservations(filtered)
  }

  const handleCancelReservation = async (reservationId: string, reservationData: Reservation) => {
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
        description: `${reservationData.court.name} - ${reservationData.user.name}`
      })

      // Recargar datos
      await loadData()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error cancelling reservation:', error)
      toast.error('Error inesperado al cancelar la reserva')
    }
  }

  const handleCompleteReservation = async (reservationId: string, reservationData: Reservation) => {
    const loadingToast = toast.loading('Marcando como completada...', {
      description: 'Actualizando estado de reserva'
    })

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'COMPLETED' })
        .eq('id', reservationId)

      toast.dismiss(loadingToast)

      if (error) {
        toast.error('Error al marcar como completada', {
          description: error.message
        })
        return
      }

      toast.success('Reserva marcada como completada', {
        description: `${reservationData.court.name} - ${reservationData.user.name}`
      })

      await loadData()
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Error completing reservation:', error)
      toast.error('Error inesperado al completar la reserva')
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

  const clearFilters = () => {
    setFilters({
      status: 'all',
      sportType: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      searchTerm: ''
    })
    setSelectedDate(undefined)
  }

  // Estadísticas para las tabs
  const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
  const todayReservations = reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.date === today && r.status === 'ACTIVE'
  })
  const completedReservations = reservations.filter(r => r.status === 'COMPLETED')
  const cancelledReservations = reservations.filter(r => r.status.includes('CANCELLED'))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando gestión de reservas...</p>
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
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Panel
                </Link>
              </Button>
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => loadData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Búsqueda */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuario, cancha..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Estado */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVE">Activas</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  <SelectItem value="CANCELLED_ADMIN">Canceladas por Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Deporte */}
              <Select
                value={filters.sportType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Deporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deportes</SelectItem>
                  {sportTypes.map((sport) => (
                    <SelectItem key={sport.id} value={sport.name}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fecha desde */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: es }) : "Desde"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                  />
                </PopoverContent>
              </Popover>

              {/* Botón limpiar filtros */}
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredReservations.length}</p>
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
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold text-gray-900">{cancelledReservations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="border-b p-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Todas ({filteredReservations.length})</TabsTrigger>
                  <TabsTrigger value="active">Activas ({activeReservations.length})</TabsTrigger>
                  <TabsTrigger value="today">Hoy ({todayReservations.length})</TabsTrigger>
                  <TabsTrigger value="completed">Completadas ({completedReservations.length})</TabsTrigger>
                  <TabsTrigger value="cancelled">Canceladas ({cancelledReservations.length})</TabsTrigger>
                </TabsList>
              </div>

              {/* Todas las reservas */}
              <TabsContent value="all" className="p-6">
                <div className="space-y-4">
                  {filteredReservations.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reservas</h3>
                      <p className="text-gray-600">Ajusta los filtros para ver más resultados</p>
                    </div>
                  ) : (
                    filteredReservations.map((reservation) => (
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
                                    <User className="h-4 w-4" />
                                    {reservation.user.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {reservation.user.phone || 'Sin teléfono'}
                                  </div>
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
                                  Precio: ${reservation.court.price_per_hour} • Creada: {new Date(reservation.created_at).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {getStatusBadge(reservation.status, reservation.penalty_applied)}
                              
                              {reservation.status === 'ACTIVE' && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCompleteReservation(reservation.id, reservation)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Completar
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Cancelar
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Se cancelará la reserva de <strong>{reservation.user.name}</strong> para{' '}
                                          <strong>{reservation.court.name}</strong> el{' '}
                                          <strong>{formatDate(new Date(reservation.date))}</strong> de{' '}
                                          <strong>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</strong>.
                                          <br /><br />
                                          <strong>No se aplicará penalización</strong> al usuario.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCancelReservation(reservation.id, reservation)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Cancelar reserva
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Otros tabs con filtros automáticos */}
              <TabsContent value="active" className="p-6">
                <div className="space-y-4">
                  {activeReservations.map((reservation) => (
                    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                      {/* Same content as above but filtered */}
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
                                  <User className="h-4 w-4" />
                                  {reservation.user.name}
                                </div>
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
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteReservation(reservation.id, reservation)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se cancelará la reserva sin penalización para el usuario.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Mantener</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelReservation(reservation.id, reservation)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Cancelar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Similar structure for other tabs... */}
              <TabsContent value="today" className="p-6">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reservas de hoy: {todayReservations.length}</h3>
                  <p className="text-gray-600">Vista detallada en desarrollo</p>
                </div>
              </TabsContent>

              <TabsContent value="completed" className="p-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reservas completadas: {completedReservations.length}</h3>
                  <p className="text-gray-600">Vista detallada en desarrollo</p>
                </div>
              </TabsContent>

              <TabsContent value="cancelled" className="p-6">
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reservas canceladas: {cancelledReservations.length}</h3>
                  <p className="text-gray-600">Vista detallada en desarrollo</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}