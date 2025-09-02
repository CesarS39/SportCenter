
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Trophy, ArrowLeft, Calendar as CalendarIcon, Clock, Users, DollarSign, ChevronDown, ChevronRight } from 'lucide-react'
import { formatDate, getOperatingHours, generateTimeSlots, isOperatingDay } from '@/lib/utils'
import { toast } from 'sonner'

interface Court {
  id: string
  name: string
  price_per_hour: number
  max_people: number
  image_url: string | null
  active: boolean
  sport_type: {
    id: string
    name: string
    description: string | null
  }
}

interface Reservation {
  id: string
  start_time: string
  end_time: string
  court_id: string
}

export default function ReservasPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(1) // 1 o 2 horas
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [openSportTypes, setOpenSportTypes] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedCourt, selectedDate])

  const loadInitialData = async () => {
    try {
      // Verificar usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // Cargar canchas
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select(`
          *,
          sport_type:sport_types (
            id,
            name,
            description
          )
        `)
        .eq('active', true)

      if (courtsError) {
        console.error('Error loading courts:', courtsError)
        toast.error('Error al cargar las canchas')
      } else {
        setCourts(courtsData || [])
        // Abrir el primer tipo de deporte por defecto
        if (courtsData && courtsData.length > 0) {
          setOpenSportTypes([courtsData[0].sport_type.id])
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedCourt || !selectedDate) return

    try {
      // Obtener reservas existentes para la fecha y cancha seleccionada
      const { data: reservationsData, error } = await supabase
        .from('reservations')
        .select('id, start_time, end_time, court_id')
        .eq('court_id', selectedCourt.id)
        .eq('date', selectedDate.toISOString().split('T')[0])
        .eq('status', 'ACTIVE')

      if (error) {
        console.error('Error loading reservations:', error)
        toast.error('Error al cargar las reservas')
        return
      }

      setExistingReservations(reservationsData || [])

      // Generar slots disponibles basados en horarios de operación
      const operatingHours = getOperatingHours(selectedDate)
      const allSlots = generateTimeSlots(operatingHours.start, operatingHours.end)

      // Filtrar slots ocupados
      const occupiedSlots = new Set<string>()
      
      reservationsData?.forEach((reservation) => {
        const startTime = reservation.start_time.slice(0, 5)
        const endTime = reservation.end_time.slice(0, 5)
        
        // Marcar todos los slots entre start y end como ocupados
        const startIndex = allSlots.indexOf(startTime)
        const endIndex = allSlots.indexOf(endTime)
        
        for (let i = startIndex; i < endIndex; i++) {
          if (i >= 0 && i < allSlots.length) {
            occupiedSlots.add(allSlots[i])
          }
        }
      })

      const availableSlots = allSlots.filter(slot => !occupiedSlots.has(slot))
      setAvailableSlots(availableSlots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      toast.error('Error al cargar los horarios disponibles')
    }
  }

  const canSelectTimeSlot = (slot: string): boolean => {
    if (!selectedDate) return false

    const operatingHours = getOperatingHours(selectedDate)
    const allSlots = generateTimeSlots(operatingHours.start, operatingHours.end)
    
    const slotIndex = allSlots.indexOf(slot)
    if (slotIndex === -1) return false

    // Verificar si el slot actual está disponible
    if (!availableSlots.includes(slot)) return false
    
    // Verificar si hay suficientes slots consecutivos disponibles para la duración
    for (let i = 0; i < duration; i++) {
      const nextSlotIndex = slotIndex + i
      if (nextSlotIndex >= allSlots.length) return false
      
      const nextSlot = allSlots[nextSlotIndex]
      if (!availableSlots.includes(nextSlot)) return false
    }
    
    return true
  }

  const toggleSportType = (sportTypeId: string) => {
    setOpenSportTypes(prev => 
      prev.includes(sportTypeId) 
        ? prev.filter(id => id !== sportTypeId)
        : [...prev, sportTypeId]
    )
  }

  // Agrupar canchas por deporte
  const courtsBySport = courts.reduce((acc, court) => {
    const sportTypeId = court.sport_type.id
    if (!acc[sportTypeId]) {
      acc[sportTypeId] = {
        sport_type: court.sport_type,
        courts: []
      }
    }
    acc[sportTypeId].courts.push(court)
    return acc
  }, {} as Record<string, { sport_type: any, courts: Court[] }>)

  const handleReservation = async () => {
    if (!user || !selectedCourt || !selectedTimeSlot || !selectedDate) {
      toast.error('Por favor completa todos los campos', {
        description: 'Selecciona cancha, fecha y horario antes de continuar'
      })
      return
    }

    // Validar que la fecha sea futura (mínimo 24 horas)
    const now = new Date()
    const selectedDateTime = new Date(selectedDate)
    const hoursDifference = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursDifference < 24) {
      toast.error('Fecha inválida', {
        description: 'Debes reservar con al menos 24 horas de anticipación'
      })
      return
    }

    // Mostrar toast de carga
    const loadingToast = toast.loading('Creando tu reserva...', {
      description: 'Por favor espera un momento'
    })

    try {
      const startTime = selectedTimeSlot
      const startHour = parseInt(startTime.split(':')[0])
      const startMinute = parseInt(startTime.split(':')[1])
      const endHour = startHour + duration
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`

      // Generar ID único para la reserva
      const reservationId = 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      const { error } = await supabase
        .from('reservations')
        .insert({
          id: reservationId,
          user_id: user.id,
          court_id: selectedCourt.id,
          date: selectedDate.toISOString().split('T')[0],
          start_time: `${startTime}:00`,
          end_time: `${endTime}:00`,
          status: 'ACTIVE'
        })

      // Cerrar el toast de carga
      toast.dismiss(loadingToast)

      if (error) {
        console.error('Error creating reservation:', error)
        toast.error('Error al crear la reserva', {
          description: error.message,
          action: {
            label: 'Intentar de nuevo',
            onClick: () => handleReservation(),
          },
        })
        return
      }

      toast.success('¡Reserva creada exitosamente!', {
        description: `${selectedCourt.name} - ${formatDate(selectedDate)} de ${selectedTimeSlot} a ${endTime}`,
        action: {
          label: 'Ver mis reservas',
          onClick: () => router.push('/reservas/mis-reservas'),
        },
      })

      // Esperar un poco para mostrar el toast y luego redirigir
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      // Cerrar el toast de carga
      toast.dismiss(loadingToast)
      
      console.error('Error creating reservation:', error)
      toast.error('Error inesperado', {
        description: 'No se pudo crear la reserva. Por favor intenta de nuevo.',
        action: {
          label: 'Reintentar',
          onClick: () => handleReservation(),
        },
      })
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando canchas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Hacer Reserva</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Paso 1: Seleccionar Cancha */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Seleccionar Cancha
              </CardTitle>
              <CardDescription>
                Elige la cancha que deseas reservar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(courtsBySport).map(([sportTypeId, { sport_type, courts }]) => (
                <Collapsible 
                  key={sportTypeId}
                  open={openSportTypes.includes(sportTypeId)}
                  onOpenChange={() => toggleSportType(sportTypeId)}
                >
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {sport_type.name === 'Tenis' && '🎾'}
                              {sport_type.name === 'Pádel' && '🏓'}
                              {sport_type.name === 'Fútbol' && '⚽'}
                            </div>
                            <div>
                              <h3 className="font-semibold">{sport_type.name}</h3>
                              <p className="text-sm text-gray-600">{courts.length} cancha{courts.length !== 1 ? 's' : ''} disponible{courts.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          {openSportTypes.includes(sportTypeId) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    {courts.map((court) => (
                      <Card 
                        key={court.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ml-4 ${
                          selectedCourt?.id === court.id ? 'ring-2 ring-green-500' : ''
                        }`}
                        onClick={() => setSelectedCourt(court)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{court.name}</h4>
                            {selectedCourt?.id === court.id && (
                              <Badge className="bg-green-600">Seleccionada</Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              ${court.price_per_hour}/hora
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Hasta {court.max_people} personas
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>

          {/* Paso 2: Seleccionar Fecha */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`${selectedCourt ? 'bg-green-600' : 'bg-gray-400'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm`}>2</span>
                Seleccionar Fecha
              </CardTitle>
              <CardDescription>
                Elige el día para tu reserva
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCourt ? (
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date)
                      setSelectedTimeSlot(null) // Reset tiempo al cambiar fecha
                    }}
                    disabled={(date) => {
                      const today = new Date()
                      const tomorrow = new Date()
                      tomorrow.setDate(today.getDate() + 1)
                      
                      return (
                        date < tomorrow || // Mínimo mañana
                        !isOperatingDay(date) // Solo días operativos
                      )
                    }}
                    className="rounded-md border"
                  />
                  {!selectedDate && (
                    <Alert>
                      <CalendarIcon className="h-4 w-4" />
                      <AlertDescription>
                        Selecciona una fecha para continuar con tu reserva.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Primero selecciona una cancha
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paso 3: Seleccionar Horario */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={`${selectedCourt && selectedDate ? 'bg-green-600' : 'bg-gray-400'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm`}>3</span>
                Seleccionar Horario
              </CardTitle>
              <CardDescription>
                Elige la hora y duración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCourt && selectedDate ? (
                <>
                  {/* Seleccionar duración */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duración</label>
                    <div className="flex gap-2">
                      <Button
                        variant={duration === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDuration(1)
                          setSelectedTimeSlot(null) // Reset selección de hora
                        }}
                      >
                        1 hora
                      </Button>
                      <Button
                        variant={duration === 2 ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDuration(2)
                          setSelectedTimeSlot(null) // Reset selección de hora
                        }}
                      >
                        2 horas
                      </Button>
                    </div>
                  </div>

                  {/* Horarios disponibles */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Horarios Disponibles</label>
                    {availableSlots.length === 0 ? (
                      <Alert>
                        <CalendarIcon className="h-4 w-4" />
                        <AlertDescription>
                          No hay horarios disponibles para esta fecha.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTimeSlot === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeSlot(slot)}
                            disabled={!canSelectTimeSlot(slot)}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {slot}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resumen y confirmación */}
                  {selectedTimeSlot && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Resumen de Reserva</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Cancha:</strong> {selectedCourt.name}</p>
                        <p><strong>Fecha:</strong> {formatDate(selectedDate)}</p>
                        <p><strong>Hora:</strong> {selectedTimeSlot} - {
                          (() => {
                            const startHour = parseInt(selectedTimeSlot.split(':')[0])
                            const startMinute = parseInt(selectedTimeSlot.split(':')[1])
                            const endHour = startHour + duration
                            return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
                          })()
                        }</p>
                        <p><strong>Duración:</strong> {duration} hora{duration > 1 ? 's' : ''}</p>
                        <p><strong>Precio:</strong> ${selectedCourt.price_per_hour * duration}</p>
                      </div>
                      <Button className="w-full mt-4" onClick={handleReservation}>
                        Confirmar Reserva
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Selecciona cancha y fecha primero
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}