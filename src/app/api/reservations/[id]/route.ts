import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { cancelUserReservation } from '@/lib/services/reservations.service'

const ERROR_MESSAGES: Record<string, { status: number; message: string }> = {
  FORBIDDEN: { status: 403, message: 'No puedes cancelar una reserva de otro usuario' },
  NOT_ACTIVE: { status: 409, message: 'La reserva ya no está activa' },
  TOO_LATE: { status: 409, message: 'Solo puedes cancelar hasta 2 horas antes de la reserva' },
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser()
    const { id } = await params

    const reservation = await cancelUserReservation(id, user.id)
    return NextResponse.json({ reservation })
  } catch (error) {
    if (error instanceof Error && ERROR_MESSAGES[error.message]) {
      const { status, message } = ERROR_MESSAGES[error.message]
      return NextResponse.json({ error: message }, { status })
    }
    return errorResponse(error)
  }
}
