import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { createCourt, listAllCourts, parseCourtInput } from '@/lib/services/courts.service'

export async function GET() {
  try {
    await requireAdmin()
    const courts = await listAllCourts()
    return NextResponse.json({ courts })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const input = parseCourtInput(await request.json())
    const court = await createCourt(input)
    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
