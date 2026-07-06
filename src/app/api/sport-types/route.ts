import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listSportTypes } from '@/lib/services/sport-types.service'

export async function GET() {
  try {
    await requireUser()
    const sportTypes = await listSportTypes()
    return NextResponse.json({ sportTypes })
  } catch (error) {
    return errorResponse(error)
  }
}
