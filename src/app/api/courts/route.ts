import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listActiveCourts } from '@/lib/services/courts.service'

export async function GET() {
  try {
    await requireUser()
    const courts = await listActiveCourts()
    return NextResponse.json({ courts })
  } catch (error) {
    return errorResponse(error)
  }
}
