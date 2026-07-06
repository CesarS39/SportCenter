import { BarChart3, Calendar as CalendarIcon, CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import type { AdminStats } from '@/lib/hooks/use-admin-stats'

export function AdminStatsGrid({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCard icon={CalendarIcon} iconClassName="text-blue-600" label="Total" value={stats.totalReservations} compact />
      <StatCard icon={CheckCircle} iconClassName="text-green-600" label="Activas" value={stats.activeReservations} compact />
      <StatCard icon={MapPin} iconClassName="text-purple-600" label="Canchas" value={stats.totalCourts} compact />
      <StatCard icon={Users} iconClassName="text-orange-600" label="Usuarios" value={stats.totalUsers} compact />
      <StatCard icon={Clock} iconClassName="text-yellow-600" label="Hoy" value={stats.todayReservations} compact />
      <StatCard icon={BarChart3} iconClassName="text-green-600" label="Ingresos" value={`$${stats.revenue}`} compact />
    </div>
  )
}
