'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/use-require-auth'
import {
  canSelectContiguousSlot,
  computeAvailableSlots,
  groupCourtsBySport,
  useCourtAvailability,
  useCourts,
  type Court,
} from '@/lib/hooks/use-courts'
import { computeEndTime, useCreateReservation, validateAdvanceBooking } from '@/lib/hooks/use-reservations'
import { BookingStepper } from '@/components/reservas/booking-stepper'
import { CourtSelectorStep } from '@/components/reservas/court-selector-step'
import { DateSelectorStep } from '@/components/reservas/date-selector-step'
import { TimeSelectorStep } from '@/components/reservas/time-selector-step'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { formatDate, generateTimeSlots, getOperatingHours } from '@/lib/utils'
import { toast } from 'sonner'

export default function ReservasPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [duration, setDuration] = useState<1 | 2>(1)
  const [openSportTypes, setOpenSportTypes] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useRequireAuth()

  const { data: courts = [], isLoading: isCourtsLoading } = useCourts()
  const dateStr = selectedDate?.toISOString().split('T')[0]
  const { data: existingReservations = [] } = useCourtAvailability(selectedCourt?.id, dateStr)
  const createReservation = useCreateReservation()

  const loading = isUserLoading || isCourtsLoading

  const availableSlots =
    selectedCourt && selectedDate
      ? computeAvailableSlots(
          generateTimeSlots(getOperatingHours(selectedDate).start, getOperatingHours(selectedDate).end),
          existingReservations
        )
      : []

  const effectiveOpenSportTypes =
    openSportTypes.length === 0 && courts.length > 0 ? [courts[0].sportType.id] : openSportTypes

  const canSelectTimeSlot = (slot: string): boolean => {
    if (!selectedDate) return false
    const operatingHours = getOperatingHours(selectedDate)
    const allSlots = generateTimeSlots(operatingHours.start, operatingHours.end)
    return canSelectContiguousSlot(allSlots, availableSlots, slot, duration)
  }

  const toggleSportType = (sportTypeId: string) => {
    setOpenSportTypes(
      effectiveOpenSportTypes.includes(sportTypeId)
        ? effectiveOpenSportTypes.filter((id) => id !== sportTypeId)
        : [...effectiveOpenSportTypes, sportTypeId]
    )
  }

  const courtsBySport = groupCourtsBySport(courts)

  const handleCourtSelection = (court: Court) => {
    setSelectedCourt(court)
    setCurrentStep(2)
    setSelectedTimeSlot(null)
  }

  const handleDateSelection = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    if (date) setCurrentStep(3)
  }

  const handleReservation = () => {
    if (!user || !selectedCourt || !selectedTimeSlot || !selectedDate) {
      toast.error('Por favor completa todos los campos', {
        description: 'Selecciona cancha, fecha y horario antes de continuar',
      })
      return
    }

    const advanceError = validateAdvanceBooking(selectedDate)
    if (advanceError) {
      toast.error('Fecha inválida', { description: advanceError })
      return
    }

    const endTime = computeEndTime(selectedTimeSlot, duration)

    const loadingToast = toast.loading('Creando tu reserva...', { description: 'Por favor espera un momento' })

    createReservation.mutate(
      { courtId: selectedCourt.id, date: dateStr!, startTime: `${selectedTimeSlot}:00`, endTime: `${endTime}:00` },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast)
          toast.success('¡Reserva creada exitosamente!', {
            description: `${selectedCourt.name} - ${formatDate(selectedDate)} de ${selectedTimeSlot} a ${endTime}`,
          })
          setTimeout(() => router.push('/dashboard'), 1500)
        },
        onError: (error) => {
          toast.dismiss(loadingToast)
          toast.error('Error al crear la reserva', {
            description: error instanceof Error ? error.message : 'No se pudo crear la reserva.',
          })
        },
      }
    )
  }

  if (loading) {
    return <FullscreenLoader message="Cargando canchas..." />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader title="Hacer Reserva" backHref="/dashboard" />

      <BookingStepper currentStep={currentStep} selectedCourt={selectedCourt} selectedDate={selectedDate} selectedTimeSlot={selectedTimeSlot} />

      <main className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsContent value="step-1">
            <CourtSelectorStep
              courtsBySport={courtsBySport}
              openSportTypes={effectiveOpenSportTypes}
              selectedCourtId={selectedCourt?.id ?? null}
              onToggleSportType={toggleSportType}
              onSelectCourt={handleCourtSelection}
            />
          </TabsContent>

          <TabsContent value="step-2">
            {selectedCourt && (
              <DateSelectorStep
                selectedCourt={selectedCourt}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelection}
                onChangeCourt={() => setCurrentStep(1)}
              />
            )}
          </TabsContent>

          <TabsContent value="step-3">
            {selectedCourt && selectedDate && (
              <TimeSelectorStep
                selectedCourt={selectedCourt}
                selectedDate={selectedDate}
                duration={duration}
                onChangeDuration={(d) => {
                  setDuration(d)
                  setSelectedTimeSlot(null)
                }}
                availableSlots={availableSlots}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
                canSelectTimeSlot={canSelectTimeSlot}
                onChangeDate={() => setCurrentStep(2)}
                onConfirm={handleReservation}
                submitting={createReservation.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
