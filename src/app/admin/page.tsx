'use client'

import Link from 'next/link'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { useAdminStats } from '@/lib/hooks/use-admin-stats'
import { useAdminReservationMutations } from '@/lib/hooks/use-admin-reservations'
import { useLogout } from '@/lib/hooks/use-logout'
import { AdminStatsGrid } from '@/components/admin/admin-stats-grid'
import { RecentReservationsPanel } from '@/components/admin/recent-reservations-panel'
import { RecentUsersPanel } from '@/components/admin/recent-users-panel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PageHeader } from '@/components/shared/page-header'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { getInitials } from '@/lib/utils'
import { MapPin, LogOut, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'

const EMPTY_STATS = {
  totalReservations: 0,
  activeReservations: 0,
  totalCourts: 0,
  totalUsers: 0,
  todayReservations: 0,
  revenue: 0,
}

export default function AdminDashboard() {
  const { profile, isLoading: isAdminLoading } = useRequireAdmin()
  const { data, isLoading: isStatsLoading } = useAdminStats(!isAdminLoading)
  const { cancelReservation } = useAdminReservationMutations()
  const handleLogout = useLogout()

  const loading = isAdminLoading || isStatsLoading
  const stats = data?.stats ?? EMPTY_STATS
  const recentReservations = data?.recentReservations ?? []
  const recentUsers = data?.recentUsers ?? []

  const handleCancelReservation = (reservationId: string) => {
    const loadingToast = toast.loading('Cancelando reserva...', { description: 'Cancelación administrativa' })
    cancelReservation.mutate(reservationId, {
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

  if (loading) {
    return <FullscreenLoader message="Cargando panel de administración..." />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Panel Admin"
        subtitle="SportCenter Dashboard"
        actions={
          <>
            <Button variant="outline" size="sm" asChild className="rounded-lg">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Vista Usuario</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-lg">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </>
        }
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 ring-2 ring-red-100">
              <AvatarFallback className="bg-red-50 text-red-600 text-lg font-semibold">
                {profile?.name ? getInitials(profile.name) : 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate">
                ¡Hola, {profile?.name?.split(' ')[0] || 'Admin'}! 👨‍💼
              </h2>
              <p className="text-sm text-slate-500">Bienvenido al panel de administración</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button asChild className="h-12 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              <Link href="/admin/canchas">
                <MapPin className="h-4 w-4 mr-2" />
                Gestionar Canchas
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-12 text-sm rounded-xl">
              <Link href="/admin/reservas">Ver Reservas</Link>
            </Button>
            <Button variant="outline" asChild className="h-12 text-sm rounded-xl">
              <Link href="/admin/usuarios">Gestionar Usuarios</Link>
            </Button>
          </div>
        </div>

        <AdminStatsGrid stats={stats} />

        <div className="lg:hidden">
          <Tabs defaultValue="reservations" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="reservations" className="text-xs">Reservas Recientes</TabsTrigger>
              <TabsTrigger value="users" className="text-xs">Usuarios Recientes</TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
              <RecentReservationsPanel
                reservations={recentReservations}
                onCancel={handleCancelReservation}
                variant="mobile"
              />
            </TabsContent>

            <TabsContent value="users">
              <RecentUsersPanel users={recentUsers} variant="mobile" />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
          <RecentReservationsPanel
            reservations={recentReservations}
            onCancel={handleCancelReservation}
            variant="desktop"
          />
          <RecentUsersPanel users={recentUsers} variant="desktop" />
        </div>
      </main>
    </div>
  )
}
