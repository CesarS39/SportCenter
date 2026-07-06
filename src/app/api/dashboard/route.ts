import { NextResponse } from 'next/server'
import { requireProfile } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listUserReservations } from '@/lib/services/reservations.service'

export async function GET() {
  try {
    const { user, profile } = await requireProfile()
    const reservations = await listUserReservations(user.id, { fromToday: true })
    return NextResponse.json({ profile, reservations })
  } catch (error) {
    return errorResponse(error)
  }
}
