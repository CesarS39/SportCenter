import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listActiveReservationsForCourtAndDate } from '@/lib/services/reservations.service'

export async function GET(request: Request, { params }: { params: Promise<{ courtId: string }> }) {
  try {
    await requireUser()
    const { courtId } = await params
    const date = new URL(request.url).searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'El parámetro date es obligatorio' }, { status: 400 })
    }

    const reservations = await listActiveReservationsForCourtAndDate(courtId, date)
    return NextResponse.json({ reservations })
  } catch (error) {
    return errorResponse(error)
  }
}
