import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react'
import { ReservationStatusBadge } from '@/components/shared/reservation-status-badge'
import { getSportIcon } from '@/lib/sport-icons'
import { formatDate, formatTime } from '@/lib/utils'
import type { Reservation } from '@/lib/hooks/use-reservations'

function canCancelReservation(reservation: Reservation): boolean {
  if (reservation.status !== 'ACTIVE') return false
  const reservationDateTime = new Date(`${reservation.date}T${reservation.startTime}`)
  const hoursUntil = (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
  return hoursUntil >= 2
}

function getTimeUntilCancellation(reservation: Reservation): string {
  const reservationDateTime = new Date(`${reservation.date}T${reservation.startTime}`)
  const hoursUntil = (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntil < 2) return 'No se puede cancelar (menos de 2 horas)'
  const hours = Math.floor(hoursUntil)
  const minutes = Math.floor((hoursUntil - hours) * 60)
  return `Se puede cancelar por ${hours}h ${minutes}m más`
}

interface MyReservationCardProps {
  reservation: Reservation
  onCancel: (id: string) => void
  cancelling: boolean
  showCancellationHint?: boolean
  isPast?: boolean
}

export function MyReservationCard({
  reservation,
  onCancel,
  cancelling,
  showCancellationHint = false,
  isPast = false,
}: MyReservationCardProps) {
  return (
    <Card className={`rounded-2xl border-slate-100 hover:shadow-md transition-shadow ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`text-3xl flex-shrink-0 ${isPast ? 'grayscale' : ''}`}>{getSportIcon(reservation.court.sportType.name)}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{reservation.court.name}</h3>
                <Badge variant="outline">{reservation.court.sportType.name}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(new Date(reservation.date))}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </div>
              </div>
              {showCancellationHint && (
                <p className="text-xs text-slate-500 mt-1">{getTimeUntilCancellation(reservation)}</p>
              )}
              {isPast && (
                <p className="text-xs text-slate-500 mt-1">Precio pagado: ${reservation.court.pricePerHour}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <ReservationStatusBadge status={reservation.status} penaltyApplied={reservation.penaltyApplied} />
            {canCancelReservation(reservation) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(reservation.id)}
                disabled={cancelling}
                className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                {cancelling ? 'Cancelando...' : 'Cancelar'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
