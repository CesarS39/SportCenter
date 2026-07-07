'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRequireAuth } from '@/lib/hooks/use-require-auth'
import { useDashboard } from '@/lib/hooks/use-dashboard'
import { useLogout } from '@/lib/hooks/use-logout'
import { useReservationBuckets } from '@/lib/hooks/use-reservation-buckets'
import { DashboardMenuSheet } from '@/components/dashboard/dashboard-menu-sheet'
import { UpcomingReservationCard } from '@/components/dashboard/upcoming-reservation-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { getInitials } from '@/lib/utils'
import { Calendar, Clock, Plus, Trophy, Bell } from 'lucide-react'

export default function DashboardPage() {
  const [showMenu, setShowMenu] = useState(false)
  const { isLoading: isUserLoading } = useRequireAuth()
  const { data, isLoading: isDashboardLoading } = useDashboard()
  const handleLogout = useLogout()

  const loading = isUserLoading || isDashboardLoading
  const profile = data?.profile
  const reservations = data?.reservations ?? []
  const { active: activeReservations, today: todayReservations } = useReservationBuckets(reservations)

  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const thisWeekCount = activeReservations.filter((r) => new Date(r.date) <= weekFromNow).length

  if (loading) {
    return <FullscreenLoader message="Cargando..." />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="SportCenter"
        actions={
          <>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <DashboardMenuSheet open={showMenu} onOpenChange={setShowMenu} profile={profile} onLogout={handleLogout} />
          </>
        }
      />

      <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-emerald-100">
              <AvatarFallback className="bg-emerald-50 text-emerald-600 text-lg font-semibold">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-slate-900 truncate">
                ¡Hola, {profile?.name?.split(' ')[0] || 'Usuario'}! 👋
              </h2>
              <p className="text-slate-500 text-sm">Bienvenido a tu panel de reservas</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <Button asChild className="w-full sm:flex-1 sm:max-w-xs h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              <Link href="/reservas">
                <Plus className="h-5 w-5 mr-2" />
                Nueva Reserva
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto h-12 rounded-xl">
              <Link href="/reservas/mis-reservas">Ver Todas mis Reservas</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Calendar} tint="blue" label="Reservas Activas" value={activeReservations.length} />
          <StatCard icon={Clock} tint="emerald" label="Hoy" value={todayReservations.length} />
          <StatCard icon={Trophy} tint="yellow" label="Esta Semana" value={thisWeekCount} />
        </div>

        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Próximas Reservas</CardTitle>
                <CardDescription className="text-sm">Tus reservas activas próximas</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reservas/mis-reservas">Ver todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeReservations.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No tienes reservas activas"
                description="¡Haz tu primera reserva y disfruta de nuestras canchas!"
                action={{ label: 'Hacer Reserva', href: '/reservas' }}
                compact
              />
            ) : (
              <div className="space-y-3">
                {activeReservations.slice(0, 5).map((reservation) => (
                  <UpcomingReservationCard key={reservation.id} reservation={reservation} />
                ))}

                {activeReservations.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/reservas/mis-reservas">Ver todas las reservas</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <Button asChild size="lg" className="rounded-full shadow-lg shadow-emerald-600/30 h-14 w-14 p-0 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/reservas">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
