import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowRight, XCircle } from 'lucide-react'
import { ReservationStatusBadge } from '@/components/shared/reservation-status-badge'
import { getSportIcon } from '@/lib/sport-icons'
import { formatDate, formatTime } from '@/lib/utils'
import type { Reservation } from '@/lib/hooks/use-reservations'

interface RecentReservationsPanelProps {
  reservations: Reservation[]
  onCancel: (reservationId: string) => void
  variant: 'mobile' | 'desktop'
}

export function RecentReservationsPanel({ reservations, onCancel, variant }: RecentReservationsPanelProps) {
  const items = reservations.slice(0, 5)

  if (variant === 'mobile') {
    return (
      <Card className="rounded-2xl border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Reservas Recientes</CardTitle>
              <CardDescription className="text-sm">Últimas reservas realizadas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/reservas">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((reservation) => (
              <Card key={reservation.id} className="rounded-xl border-slate-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl flex-shrink-0">{getSportIcon(reservation.court.sportType.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{reservation.court.name}</h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {reservation.court.sportType.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{reservation.user.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{formatDate(new Date(reservation.date))}</span>
                        <span>•</span>
                        <span>{formatTime(reservation.startTime)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ReservationStatusBadge status={reservation.status} penaltyApplied={reservation.penaltyApplied} />
                      {reservation.status === 'ACTIVE' && (
                        <CancelReservationDialog
                          userName={reservation.user.name}
                          onConfirm={() => onCancel(reservation.id)}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 h-6 w-6 p-0">
                              <XCircle className="h-3 w-3" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reservas Recientes</CardTitle>
            <CardDescription>Últimas reservas realizadas en el sistema</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-lg">
            <Link href="/admin/reservas">
              Ver todas <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((reservation) => (
            <div key={reservation.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="text-2xl flex-shrink-0">{getSportIcon(reservation.court.sportType.name)}</div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{reservation.court.name}</p>
                  <p className="text-sm text-slate-600 truncate">
                    {reservation.user.name} • {formatDate(new Date(reservation.date))} • {formatTime(reservation.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ReservationStatusBadge status={reservation.status} penaltyApplied={reservation.penaltyApplied} />
                {reservation.status === 'ACTIVE' && (
                  <CancelReservationDialog
                    userName={reservation.user.name}
                    onConfirm={() => onCancel(reservation.id)}
                    trigger={
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CancelReservationDialog({
  userName,
  onConfirm,
  trigger,
}: {
  userName: string
  onConfirm: () => void
  trigger: React.ReactNode
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>
          <AlertDialogDescription>
            Se cancelará la reserva de {userName} sin penalización para el usuario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Mantener reserva</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Cancelar reserva
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
