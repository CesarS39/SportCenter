import { BarChart3, Calendar as CalendarIcon, CheckCircle, Clock, MapPin, Users } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import type { AdminStats } from '@/lib/hooks/use-admin-stats'

export function AdminStatsGrid({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <StatCard icon={CalendarIcon} tint="blue" label="Total" value={stats.totalReservations} compact />
      <StatCard icon={CheckCircle} tint="emerald" label="Activas" value={stats.activeReservations} compact />
      <StatCard icon={MapPin} tint="purple" label="Canchas" value={stats.totalCourts} compact />
      <StatCard icon={Users} tint="orange" label="Usuarios" value={stats.totalUsers} compact />
      <StatCard icon={Clock} tint="yellow" label="Hoy" value={stats.todayReservations} compact />
      <StatCard icon={BarChart3} tint="emerald" label="Ingresos" value={`$${stats.revenue}`} compact />
    </div>
  )
}
