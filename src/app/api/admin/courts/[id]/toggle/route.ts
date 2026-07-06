import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { toggleCourtActive } from '@/lib/services/courts.service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const court = await toggleCourtActive(id)
    return NextResponse.json({ court })
  } catch (error) {
    return errorResponse(error)
  }
}
