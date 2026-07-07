'use client'

import { useState } from 'react'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { useAdminCourtMutations, useAdminCourts, type Court, type CourtFormInput } from '@/lib/hooks/use-courts'
import { useSportTypes } from '@/lib/hooks/use-sport-types'
import { CourtCard } from '@/components/admin/canchas/court-card'
import { CourtFormDialog } from '@/components/admin/canchas/court-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { Plus, MapPin, Eye, EyeOff, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminCanchasPage() {
  const { isLoading: isAdminLoading } = useRequireAdmin()
  const { data: courts = [], isLoading: isCourtsLoading } = useAdminCourts(!isAdminLoading)
  const { data: sportTypes = [] } = useSportTypes(!isAdminLoading)
  const { createCourt, updateCourt, toggleActive, deleteCourt } = useAdminCourtMutations()

  const [showDialog, setShowDialog] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  const loading = isAdminLoading || isCourtsLoading
  const submitting = createCourt.isPending || updateCourt.isPending

  const openCreateDialog = () => {
    setEditingCourt(null)
    setShowDialog(true)
  }

  const openEditDialog = (court: Court) => {
    setEditingCourt(court)
    setShowDialog(true)
  }

  const handleSubmit = (input: CourtFormInput) => {
    const loadingToast = toast.loading(editingCourt ? 'Actualizando cancha...' : 'Creando cancha...')
    const mutation = editingCourt
      ? updateCourt.mutateAsync({ id: editingCourt.id, input })
      : createCourt.mutateAsync(input)

    mutation
      .then(() => {
        toast.dismiss(loadingToast)
        toast.success(editingCourt ? 'Cancha actualizada exitosamente' : 'Cancha creada exitosamente')
        setShowDialog(false)
      })
      .catch(() => {
        toast.dismiss(loadingToast)
        toast.error('Error al guardar la cancha')
      })
  }

  const handleToggleActive = (court: Court) => {
    const loadingToast = toast.loading(`${court.active ? 'Desactivando' : 'Activando'} cancha...`)
    toggleActive.mutate(court.id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success(`Cancha ${court.active ? 'desactivada' : 'activada'} exitosamente`)
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al cambiar el estado de la cancha')
      },
    })
  }

  const handleDelete = (court: Court) => {
    const loadingToast = toast.loading('Eliminando cancha...')
    deleteCourt.mutate(court.id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success('Cancha eliminada exitosamente')
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al eliminar la cancha')
      },
    })
  }

  if (loading) {
    return <FullscreenLoader message="Cargando gestión de canchas..." />
  }

  const activeCount = courts.filter((c) => c.active).length
  const averagePrice = courts.length > 0 ? Math.round(courts.reduce((sum, c) => sum + c.pricePerHour, 0) / courts.length) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Gestión de Canchas"
        backHref="/admin"
        actions={
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Cancha</span>
          </Button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={MapPin} tint="blue" label="Total Canchas" value={courts.length} />
          <StatCard icon={Eye} tint="emerald" label="Activas" value={activeCount} />
          <StatCard icon={EyeOff} tint="red" label="Inactivas" value={courts.length - activeCount} />
          <StatCard icon={DollarSign} tint="yellow" label="Precio Promedio" value={`$${averagePrice}`} />
        </div>

        <Card className="rounded-2xl border-slate-100">
          <CardHeader>
            <CardTitle>Lista de Canchas</CardTitle>
            <CardDescription>Gestiona todas las canchas del centro deportivo</CardDescription>
          </CardHeader>
          <CardContent>
            {courts.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No hay canchas registradas"
                description="Comienza creando tu primera cancha"
                action={{ label: 'Crear Primera Cancha', onClick: openCreateDialog }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courts.map((court) => (
                  <CourtCard
                    key={court.id}
                    court={court}
                    onEdit={openEditDialog}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CourtFormDialog
          key={editingCourt?.id ?? 'new'}
          open={showDialog}
          onOpenChange={setShowDialog}
          editingCourt={editingCourt}
          sportTypes={sportTypes}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  )
}
