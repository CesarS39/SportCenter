'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Trophy,
  ArrowLeft,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Phone,
  XCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
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

interface SportType {
  id: string
  name: string
}

export default function AdminReservasPageMobile() {
  const { isLoading: isAdminLoading } = useRequireAdmin()
  const queryClient = useQueryClient()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    sportType: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    searchTerm: ''
  })

  const { data: reservations = [], isLoading: isReservationsLoading, refetch } = useQuery({
    queryKey: ['admin-all-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) {
        toast.error('Error al cargar las reservas')
        throw error
      }
      return data as unknown as Reservation[]
    },
    enabled: !isAdminLoading,
  })

  const { data: sportTypes = [] } = useQuery({
    queryKey: ['sport-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sport_types')
        .select('*')
        .order('name')

      if (error) throw error
      return data as SportType[]
    },
    enabled: !isAdminLoading,
  })

  const loading = isAdminLoading || isReservationsLoading

  // Aplicar filtros de forma derivada (sin estado ni efectos)
  const filteredReservations = reservations.filter((r) => {
    if (filters.status !== 'all' && r.status !== filters.status) return false
    if (filters.sportType !== 'all' && r.court.sport_type.name !== filters.sportType) return false
    if (filters.dateFrom && r.date < filters.dateFrom.toISOString().split('T')[0]) return false
    if (filters.dateTo && r.date > filters.dateTo.toISOString().split('T')[0]) return false
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      if (
        !r.user.name.toLowerCase().includes(term) &&
        !r.court.name.toLowerCase().includes(term) &&
        !r.court.sport_type.name.toLowerCase().includes(term)
      ) {
        return false
      }
    }
    return true
  })

  const invalidateReservations = () => queryClient.invalidateQueries({ queryKey: ['admin-all-reservations'] })

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'CANCELLED_ADMIN',
          penalty_applied: false // Admin no aplica penalización
        })
        .eq('id', reservationId)

      if (error) throw error
    },
    onMutate: () => {
      return { loadingToast: toast.loading('Cancelando reserva...', {
        description: 'Cancelación administrativa'
      }) }
    },
    onSuccess: (_data, _reservationId, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success('Reserva cancelada por administración', {
        description: 'Sin penalización para el usuario'
      })
      invalidateReservations()
    },
    onError: (error, _reservationId, context) => {
      toast.dismiss(context?.loadingToast)
      console.error('Error cancelling reservation:', error)
      toast.error('Error al cancelar la reserva')
    },
  })

  const completeReservationMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'COMPLETED' })
        .eq('id', reservationId)

      if (error) throw error
    },
    onMutate: () => {
      return { loadingToast: toast.loading('Marcando como completada...', {
        description: 'Actualizando estado de reserva'
      }) }
    },
    onSuccess: (_data, _reservationId, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success('Reserva marcada como completada')
      invalidateReservations()
    },
    onError: (error, _reservationId, context) => {
      toast.dismiss(context?.loadingToast)
      console.error('Error completing reservation:', error)
      toast.error('Error al marcar como completada')
    },
  })

  const handleCancelReservation = (reservationId: string) => {
    cancelReservationMutation.mutate(reservationId)
  }

  const handleCompleteReservation = (reservationId: string) => {
    completeReservationMutation.mutate(reservationId)
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
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} text-xs px-1.5 py-0.5`}>
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
  }

  // Estadísticas para las tabs
  const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
  const todayReservations = reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.date === today && r.status === 'ACTIVE'
  })
  const cancelledReservations = reservations.filter(r => r.status.includes('CANCELLED'))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando gestión de reservas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Optimizado */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-0 flex-1">
              <Button variant="ghost" asChild className="mr-2 p-2 h-auto">
                <Link href="/admin">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Trophy className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Reservas
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              {/* Filtros en Sheet para móvil */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>
                      Ajusta los filtros para encontrar reservas específicas
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    {/* Búsqueda */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Buscar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Usuario, cancha..."
                          value={filters.searchTerm}
                          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Estado</label>
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
                    </div>

                    {/* Deporte */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Deporte</label>
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
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        Limpiar
                      </Button>
                      <Button onClick={() => setShowFilters(false)} className="flex-1">
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        {/* Stats Cards - Layout móvil optimizado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <Card className="p-3">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-lg font-bold text-gray-900">{filteredReservations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Activas</p>
                <p className="text-lg font-bold text-gray-900">{activeReservations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Hoy</p>
                <p className="text-lg font-bold text-gray-900">{todayReservations.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Canceladas</p>
                <p className="text-lg font-bold text-gray-900">{cancelledReservations.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reservations List - Formato de tarjetas móviles */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 text-xs">
                  <TabsTrigger value="all" className="text-xs px-2">
                    Todas ({filteredReservations.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-xs px-2">
                    Activas ({activeReservations.length})
                  </TabsTrigger>
                  <TabsTrigger value="today" className="text-xs px-2">
                    Hoy ({todayReservations.length})
                  </TabsTrigger>
                </TabsList>
                
                {/* Lista de reservas optimizada para móvil */}
                <TabsContent value="all" className="mt-4">
                  <div className="space-y-3">
                    {filteredReservations.length === 0 ? (
                      <div className="text-center py-12">
                        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reservas</h3>
                        <p className="text-gray-600">Ajusta los filtros para ver más resultados</p>
                      </div>
                    ) : (
                      filteredReservations.map((reservation) => (
                        <Card key={reservation.id} className="border shadow-sm">
                          <CardContent className="p-4">
                            {/* Header con deporte e info principal */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="text-2xl flex-shrink-0">
                                  {getSportIcon(reservation.court.sport_type.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base truncate">
                                      {reservation.court.name}
                                    </h3>
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                      {reservation.court.sport_type.name}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">
                                    {reservation.user.name}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(reservation.status, reservation.penalty_applied)}
                            </div>

                            {/* Información de fecha y hora */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{formatDate(new Date(reservation.date))}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</span>
                              </div>
                            </div>

                            {/* Información adicional en móvil */}
                            <div className="text-xs text-gray-500 mb-3 space-y-1">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{reservation.user.phone || 'Sin teléfono'}</span>
                              </div>
                              <div>
                                Precio: ${reservation.court.price_per_hour} • 
                                Creada: {new Date(reservation.created_at).toLocaleDateString('es-ES')}
                              </div>
                            </div>
                            
                            {/* Botones de acción */}
                            {reservation.status === 'ACTIVE' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCompleteReservation(reservation.id)}
                                  className="text-blue-600 hover:text-blue-700 flex-1 h-8 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completar
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 flex-1 h-8 text-xs"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="mx-4">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-sm">
                                        Se cancelará la reserva de <strong>{reservation.user.name}</strong> para{' '}
                                        <strong>{reservation.court.name}</strong> el{' '}
                                        <strong>{formatDate(new Date(reservation.date))}</strong>.
                                        <br /><br />
                                        <strong>No se aplicará penalización</strong> al usuario.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col gap-2">
                                      <AlertDialogCancel className="w-full">Mantener reserva</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        className="bg-red-600 hover:bg-red-700 w-full"
                                      >
                                        Cancelar reserva
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="active" className="mt-4">
                  <div className="space-y-3">
                    {activeReservations.map((reservation) => (
                      <Card key={reservation.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          {/* Mismo formato que arriba pero solo para activas */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="text-2xl flex-shrink-0">
                                {getSportIcon(reservation.court.sport_type.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-base truncate">
                                    {reservation.court.name}
                                  </h3>
                                  <Badge variant="outline" className="text-xs flex-shrink-0">
                                    {reservation.court.sport_type.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {reservation.user.name}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(reservation.status, reservation.penalty_applied)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{formatDate(new Date(reservation.date))}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteReservation(reservation.id)}
                              className="text-blue-600 hover:text-blue-700 flex-1 h-8 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 flex-1 h-8 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="mx-4">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Se cancelará la reserva sin penalización para el usuario.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col gap-2">
                                  <AlertDialogCancel className="w-full">Mantener</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelReservation(reservation.id)}
                                    className="bg-red-600 hover:bg-red-700 w-full"
                                  >
                                    Cancelar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="today" className="mt-4">
                  <div className="space-y-3">
                    {todayReservations.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas para hoy</h3>
                        <p className="text-gray-600">Las reservas de hoy aparecerán aquí</p>
                      </div>
                    ) : (
                      todayReservations.map((reservation) => (
                        <Card key={reservation.id} className="border shadow-sm bg-yellow-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="text-2xl flex-shrink-0">
                                  {getSportIcon(reservation.court.sport_type.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-base truncate">
                                      {reservation.court.name}
                                    </h3>
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                      {reservation.court.sport_type.name}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">
                                    {reservation.user.name}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-yellow-500 text-white">HOY</Badge>
                            </div>

                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteReservation(reservation.id)}
                                className="text-blue-600 hover:text-blue-700 flex-1 h-8 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completar
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 flex-1 h-8 text-xs"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancelar
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-4">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Cancelar reserva de hoy?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Se cancelará la reserva de hoy sin penalización para el usuario.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col gap-2">
                                    <AlertDialogCancel className="w-full">Mantener</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelReservation(reservation.id)}
                                      className="bg-red-600 hover:bg-red-700 w-full"
                                    >
                                      Cancelar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}