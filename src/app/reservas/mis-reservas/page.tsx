'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/lib/hooks/use-require-auth'
import { useCancelMyReservation, useMyReservations } from '@/lib/hooks/use-reservations'
import { useReservationBuckets } from '@/lib/hooks/use-reservation-buckets'
import { MyReservationCard } from '@/components/reservas/my-reservation-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function MisReservasPage() {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const { isLoading: isUserLoading } = useRequireAuth()
  const { data: reservations = [], isLoading: isReservationsLoading } = useMyReservations()
  const cancelReservation = useCancelMyReservation()

  const loading = isUserLoading || isReservationsLoading

  const {
    active: activeReservations,
    past: pastReservations,
    upcoming: upcomingReservations,
    today: todayReservations,
  } = useReservationBuckets(reservations)

  const handleCancelReservation = (reservationId: string) => {
    setCancellingId(reservationId)
    const loadingToast = toast.loading('Cancelando reserva...', { description: 'Por favor espera un momento' })

    cancelReservation.mutate(reservationId, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success('Reserva cancelada exitosamente', { description: 'Se ha aplicado una penalización por cancelación' })
      },
      onError: (error) => {
        toast.dismiss(loadingToast)
        toast.error(error instanceof Error ? error.message : 'Error al cancelar la reserva')
      },
      onSettled: () => setCancellingId(null),
    })
  }

  if (loading) {
    return <FullscreenLoader message="Cargando tus reservas..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Mis Reservas"
        backHref="/dashboard"
        actions={
          <Button size="sm" asChild>
            <Link href="/reservas">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Reserva</span>
            </Link>
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={CalendarIcon} iconClassName="text-blue-600" label="Total" value={reservations.length} />
          <StatCard icon={CheckCircle} iconClassName="text-green-600" label="Activas" value={activeReservations.length} />
          <StatCard icon={Clock} iconClassName="text-yellow-600" label="Hoy" value={todayReservations.length} />
          <StatCard icon={AlertCircle} iconClassName="text-orange-600" label="Próximas" value={upcomingReservations.length} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Reservas</CardTitle>
            <CardDescription>Gestiona y revisa todas tus reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Activas ({activeReservations.length})</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas ({upcomingReservations.length})</TabsTrigger>
                <TabsTrigger value="past">Historial ({pastReservations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeReservations.length === 0 ? (
                  <EmptyState
                    icon={CalendarIcon}
                    title="No tienes reservas activas"
                    description="¡Haz una nueva reserva para disfrutar de nuestras canchas!"
                    action={{ label: 'Hacer Reserva', href: '/reservas' }}
                  />
                ) : (
                  activeReservations.map((reservation) => (
                    <MyReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={handleCancelReservation}
                      cancelling={cancellingId === reservation.id}
                      showCancellationHint
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingReservations.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No tienes próximas reservas"
                    description="Todas tus reservas activas son para hoy o fechas pasadas."
                  />
                ) : (
                  upcomingReservations.map((reservation) => (
                    <MyReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={handleCancelReservation}
                      cancelling={cancellingId === reservation.id}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastReservations.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No hay historial aún"
                    description="Aquí aparecerán tus reservas completadas y canceladas."
                  />
                ) : (
                  pastReservations.map((reservation) => (
                    <MyReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={handleCancelReservation}
                      cancelling={cancellingId === reservation.id}
                      isPast
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Política de cancelación:</strong> Las reservas pueden cancelarse hasta 2 horas antes del horario
            reservado. Las cancelaciones aplican una penalización automática.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  )
}
