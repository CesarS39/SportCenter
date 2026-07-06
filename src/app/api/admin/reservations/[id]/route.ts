import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { cancelReservationAsAdmin, completeReservation } from '@/lib/services/reservations.service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { action } = await request.json()

    if (action === 'cancel') {
      const reservation = await cancelReservationAsAdmin(id)
      return NextResponse.json({ reservation })
    }
    if (action === 'complete') {
      const reservation = await completeReservation(id)
      return NextResponse.json({ reservation })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    return errorResponse(error)
  }
}
