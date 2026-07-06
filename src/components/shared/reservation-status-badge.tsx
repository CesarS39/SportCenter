import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type ReservationStatus = 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'

const STYLES: Record<ReservationStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-orange-100 text-orange-800 border-orange-200',
  CANCELLED_ADMIN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
}

const CANCELLED_WITH_PENALTY = 'bg-red-100 text-red-800 border-red-200'

const LABELS: Record<ReservationStatus, string> = {
  ACTIVE: 'Activa',
  CANCELLED: 'Cancelada',
  CANCELLED_ADMIN: 'Cancelada por Admin',
  COMPLETED: 'Completada',
}

interface ReservationStatusBadgeProps {
  status: ReservationStatus
  penaltyApplied?: boolean
  className?: string
}

export function ReservationStatusBadge({ status, penaltyApplied = false, className }: ReservationStatusBadgeProps) {
  const style = status === 'CANCELLED' && penaltyApplied ? CANCELLED_WITH_PENALTY : STYLES[status]
  const label = status === 'CANCELLED' && penaltyApplied ? 'Cancelada (Con penalización)' : LABELS[status]

  return (
    <Badge variant="outline" className={cn(style, 'text-xs', className)}>
      {label}
    </Badge>
  )
}
