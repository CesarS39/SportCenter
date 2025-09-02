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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, ArrowLeft, Calendar as CalendarIcon, Clock, Users, DollarSign, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react'
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

export default function ReservasPageMobile() {
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
  const [currentStep, setCurrentStep] = useState<number>(1)
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
    const allSlots = generateTimeSlots(
      getOperatingHours(selectedDate!).start,
      getOperatingHours(selectedDate!).end
    )
    
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

  const handleCourtSelection = (court: Court) => {
    setSelectedCourt(court)
    setCurrentStep(2)
    setSelectedTimeSlot(null)
  }

  const handleDateSelection = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    if (date) {
      setCurrentStep(3)
    }
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando canchas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center min-w-0 flex-1">
              <Button variant="ghost" asChild className="mr-2 p-2 h-auto">
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Trophy className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
              <h1 className="text-lg font-bold text-gray-900">Hacer Reserva</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {selectedCourt ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:block">Cancha</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {selectedDate ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-sm font-medium hidden sm:block">Fecha</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              {selectedTimeSlot ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-sm font-medium hidden sm:block">Horario</span>
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsContent value="step-1">
            {/* Paso 1: Seleccionar Cancha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
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
                    <CollapsibleContent className="space-y-3 mt-3">
                      {courts.map((court) => (
                        <Card 
                          key={court.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ml-4 ${
                            selectedCourt?.id === court.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                          }`}
                          onClick={() => handleCourtSelection(court)}
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
          </TabsContent>

          <TabsContent value="step-2">
            {/* Paso 2: Seleccionar Fecha */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                      Seleccionar Fecha
                    </CardTitle>
                    <CardDescription>
                      Elige el día para tu reserva
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                    Cambiar cancha
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCourt && (
                  <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {selectedCourt.sport_type.name === 'Tenis' && '🎾'}
                        {selectedCourt.sport_type.name === 'Pádel' && '🏓'}
                        {selectedCourt.sport_type.name === 'Fútbol' && '⚽'}
                      </span>
                      <div>
                        <p className="font-medium text-green-800">{selectedCourt.name}</p>
                        <p className="text-sm text-green-600">${selectedCourt.price_per_hour}/hora</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelection}
                      disabled={(date) => {
                        const today = new Date()
                        const tomorrow = new Date()
                        tomorrow.setDate(today.getDate() + 1)
                        
                        return (
                          date < tomorrow || // Mínimo mañana
                          !isOperatingDay(date) // Solo días operativos
                        )
                      }}
                      className="rounded-md border shadow-sm bg-white mx-auto"
                      classNames={{
                        months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
                        month: "space-y-4 w-full flex flex-col",
                        table: "w-full border-collapse space-y-1",
                        head_row: "",
                        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center",
                        row: "flex w-full mt-2",
                        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                        day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 mx-auto rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>

                  {!selectedDate && (
                    <Alert className="mx-4">
                      <CalendarIcon className="h-4 w-4" />
                      <AlertDescription>
                        Selecciona una fecha para continuar con tu reserva. Solo puedes reservar con 24 horas de anticipación.
                      </AlertDescription>
                    </Alert>
                  )}

                  {selectedDate && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">
                        Fecha seleccionada: {formatDate(selectedDate)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Continuemos con la selección de horario
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="step-3">
            {/* Paso 3: Seleccionar Horario */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                      Seleccionar Horario
                    </CardTitle>
                    <CardDescription>
                      Elige la hora y duración
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                    Cambiar fecha
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedCourt && selectedDate && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {selectedCourt.sport_type.name === 'Tenis' && '🎾'}
                        {selectedCourt.sport_type.name === 'Pádel' && '🏓'}
                        {selectedCourt.sport_type.name === 'Fútbol' && '⚽'}
                      </span>
                      <div>
                        <p className="font-medium text-green-800">{selectedCourt.name}</p>
                        <p className="text-sm text-green-600">{formatDate(selectedDate)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seleccionar duración */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Duración</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={duration === 1 ? "default" : "outline"}
                      onClick={() => {
                        setDuration(1)
                        setSelectedTimeSlot(null) // Reset selección de hora
                      }}
                      className="h-12"
                    >
                      1 hora
                      <div className="text-xs text-muted-foreground ml-2">
                        ${selectedCourt?.price_per_hour}
                      </div>
                    </Button>
                    <Button
                      variant={duration === 2 ? "default" : "outline"}
                      onClick={() => {
                        setDuration(2)
                        setSelectedTimeSlot(null) // Reset selección de hora
                      }}
                      className="h-12"
                    >
                      2 horas
                      <div className="text-xs text-muted-foreground ml-2">
                        ${selectedCourt ? selectedCourt.price_per_hour * 2 : 0}
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Horarios disponibles */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Horarios Disponibles</label>
                  {availableSlots.length === 0 ? (
                    <Alert>
                      <CalendarIcon className="h-4 w-4" />
                      <AlertDescription>
                        No hay horarios disponibles para esta fecha.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot(slot)}
                          disabled={!canSelectTimeSlot(slot)}
                          className="h-12 text-sm"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resumen y confirmación */}
                {selectedTimeSlot && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Cancha:</span>
                          <span>{selectedCourt?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Fecha:</span>
                          <span>{formatDate(selectedDate!)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Hora:</span>
                          <span>{selectedTimeSlot} - {
                            (() => {
                              const startHour = parseInt(selectedTimeSlot.split(':')[0])
                              const startMinute = parseInt(selectedTimeSlot.split(':')[1])
                              const endHour = startHour + duration
                              return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
                            })()
                          }</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Duración:</span>
                          <span>{duration} hora{duration > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-3">
                          <span>Total:</span>
                          <span className="text-green-600">${(selectedCourt?.price_per_hour || 0) * duration}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full h-12 text-lg" onClick={handleReservation}>
                        Confirmar Reserva
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}