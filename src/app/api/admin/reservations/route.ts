import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listAllReservations } from '@/lib/services/reservations.service'

export async function GET() {
  try {
    await requireAdmin()
    const reservations = await listAllReservations()
    return NextResponse.json({ reservations })
  } catch (error) {
    return errorResponse(error)
  }
}
