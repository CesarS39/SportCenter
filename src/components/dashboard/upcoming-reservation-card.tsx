import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { getSportIcon } from '@/lib/sport-icons'
import { formatTime } from '@/lib/utils'
import type { DashboardReservation } from '@/lib/hooks/use-dashboard'

const STATUS_STYLES: Record<DashboardReservation['status'], string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
  CANCELLED_ADMIN: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-slate-100 text-slate-800',
}

const STATUS_LABELS: Record<DashboardReservation['status'], string> = {
  ACTIVE: 'Activa',
  CANCELLED: 'Cancelada',
  CANCELLED_ADMIN: 'Cancelada por Admin',
  COMPLETED: 'Completada',
}

export function UpcomingReservationCard({ reservation }: { reservation: DashboardReservation }) {
  const reservationDate = new Date(reservation.date)
  const today = new Date()
  const isToday = reservationDate.toDateString() === today.toDateString()
  const isTomorrow = reservationDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString()

  let dateLabel = reservationDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  if (isToday) dateLabel = 'Hoy'
  else if (isTomorrow) dateLabel = 'Mañana'

  return (
    <Card className={`rounded-2xl border-slate-100 shadow-sm ${isToday ? 'bg-emerald-50 border-emerald-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{getSportIcon(reservation.court.sportType.name)}</div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{reservation.court.name}</h3>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {reservation.court.sportType.name}
              </Badge>
              {isToday && <Badge className="bg-emerald-600 text-white text-xs">HOY</Badge>}
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  {dateLabel}
                  {!isToday && !isTomorrow && (
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      ({reservationDate.toLocaleDateString('es-ES', { weekday: 'short' })})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Badge className={`${STATUS_STYLES[reservation.status]} text-xs px-1.5 py-0.5`}>
              {STATUS_LABELS[reservation.status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
