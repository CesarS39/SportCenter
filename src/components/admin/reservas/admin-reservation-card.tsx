import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Calendar as CalendarIcon, CheckCircle, Clock, Phone, XCircle } from 'lucide-react'
import { ReservationStatusBadge } from '@/components/shared/reservation-status-badge'
import { getSportIcon } from '@/lib/sport-icons'
import { formatDate, formatTime } from '@/lib/utils'
import type { Reservation } from '@/lib/hooks/use-reservations'

interface AdminReservationCardProps {
  reservation: Reservation
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  highlight?: boolean
  showDetails?: boolean
}

export function AdminReservationCard({
  reservation,
  onComplete,
  onCancel,
  highlight = false,
  showDetails = false,
}: AdminReservationCardProps) {
  return (
    <Card className={`rounded-2xl border-slate-100 shadow-sm ${highlight ? 'bg-amber-50 border-amber-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="text-2xl flex-shrink-0">{getSportIcon(reservation.court.sportType.name)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{reservation.court.name}</h3>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {reservation.court.sportType.name}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 truncate">{reservation.user.name}</p>
            </div>
          </div>
          {highlight ? (
            <Badge className="bg-amber-500 text-white rounded-full">HOY</Badge>
          ) : (
            <ReservationStatusBadge status={reservation.status} penaltyApplied={reservation.penaltyApplied} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(new Date(reservation.date))}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="text-xs text-slate-500 mb-3 space-y-1">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{reservation.user.phone || 'Sin teléfono'}</span>
            </div>
            <div>
              Precio: ${reservation.court.pricePerHour} • Creada:{' '}
              {new Date(reservation.createdAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        )}

        {reservation.status === 'ACTIVE' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplete(reservation.id)}
              className="rounded-lg text-blue-600 hover:text-blue-700 flex-1 h-8 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Completar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:text-red-700 flex-1 h-8 text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Se cancelará la reserva de <strong>{reservation.user.name}</strong> para{' '}
                    <strong>{reservation.court.name}</strong> el{' '}
                    <strong>{formatDate(new Date(reservation.date))}</strong>.
                    <br />
                    <br />
                    <strong>No se aplicará penalización</strong> al usuario.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2">
                  <AlertDialogCancel className="w-full">Mantener reserva</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(reservation.id)} className="bg-red-600 hover:bg-red-700 w-full">
                    Cancelar reserva
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
