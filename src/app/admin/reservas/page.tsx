'use client'

import { useState } from 'react'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { useAdminReservationMutations, useAdminReservations } from '@/lib/hooks/use-admin-reservations'
import { useReservationBuckets } from '@/lib/hooks/use-reservation-buckets'
import { useSportTypes } from '@/lib/hooks/use-sport-types'
import {
  ReservationFiltersSheet,
  type ReservationFilterState,
} from '@/components/admin/reservas/reservation-filters-sheet'
import { AdminReservationCard } from '@/components/admin/reservas/admin-reservation-card'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_FILTERS: ReservationFilterState = { status: 'all', sportType: 'all', searchTerm: '' }

export default function AdminReservasPage() {
  const { isLoading: isAdminLoading } = useRequireAdmin()
  const { data: reservations = [], isLoading: isReservationsLoading, refetch } = useAdminReservations(!isAdminLoading)
  const { data: sportTypes = [] } = useSportTypes(!isAdminLoading)
  const { cancelReservation, completeReservation } = useAdminReservationMutations()

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<ReservationFilterState>(DEFAULT_FILTERS)

  const loading = isAdminLoading || isReservationsLoading

  const filteredReservations = reservations.filter((r) => {
    if (filters.status !== 'all' && r.status !== filters.status) return false
    if (filters.sportType !== 'all' && r.court.sportType.name !== filters.sportType) return false
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      if (
        !r.user.name.toLowerCase().includes(term) &&
        !r.court.name.toLowerCase().includes(term) &&
        !r.court.sportType.name.toLowerCase().includes(term)
      ) {
        return false
      }
    }
    return true
  })

  const { active: activeReservations, today: todayReservations, cancelled: cancelledReservations } =
    useReservationBuckets(reservations)

  const handleCancel = (id: string) => {
    const loadingToast = toast.loading('Cancelando reserva...', { description: 'Cancelación administrativa' })
    cancelReservation.mutate(id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success('Reserva cancelada por administración', { description: 'Sin penalización para el usuario' })
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al cancelar la reserva')
      },
    })
  }

  const handleComplete = (id: string) => {
    const loadingToast = toast.loading('Marcando como completada...')
    completeReservation.mutate(id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success('Reserva marcada como completada')
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al marcar como completada')
      },
    })
  }

  if (loading) {
    return <FullscreenLoader message="Cargando gestión de reservas..." />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Reservas"
        backHref="/admin"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ReservationFiltersSheet
              open={showFilters}
              onOpenChange={setShowFilters}
              filters={filters}
              onChange={setFilters}
              sportTypes={sportTypes}
            />
          </>
        }
      />

      <main className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
          <StatCard icon={CalendarIcon} tint="blue" label="Total" value={filteredReservations.length} compact />
          <StatCard icon={CheckCircle} tint="emerald" label="Activas" value={activeReservations.length} compact />
          <StatCard icon={Clock} tint="yellow" label="Hoy" value={todayReservations.length} compact />
          <StatCard icon={AlertTriangle} tint="red" label="Canceladas" value={cancelledReservations.length} compact />
        </div>

        <Card className="rounded-2xl border-slate-100">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 text-xs">
                  <TabsTrigger value="all" className="text-xs px-2">Todas ({filteredReservations.length})</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs px-2">Activas ({activeReservations.length})</TabsTrigger>
                  <TabsTrigger value="today" className="text-xs px-2">Hoy ({todayReservations.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-3">
                    {filteredReservations.length === 0 ? (
                      <EmptyState
                        icon={CalendarIcon}
                        title="No se encontraron reservas"
                        description="Ajusta los filtros para ver más resultados"
                      />
                    ) : (
                      filteredReservations.map((reservation) => (
                        <AdminReservationCard
                          key={reservation.id}
                          reservation={reservation}
                          onComplete={handleComplete}
                          onCancel={handleCancel}
                          showDetails
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="active" className="mt-4">
                  <div className="space-y-3">
                    {activeReservations.map((reservation) => (
                      <AdminReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="today" className="mt-4">
                  <div className="space-y-3">
                    {todayReservations.length === 0 ? (
                      <EmptyState
                        icon={Clock}
                        title="No hay reservas para hoy"
                        description="Las reservas de hoy aparecerán aquí"
                        compact
                      />
                    ) : (
                      todayReservations.map((reservation) => (
                        <AdminReservationCard
                          key={reservation.id}
                          reservation={reservation}
                          onComplete={handleComplete}
                          onCancel={handleCancel}
                          highlight
                        />
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
