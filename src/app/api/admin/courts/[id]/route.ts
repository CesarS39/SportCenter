import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { deleteCourt, parseCourtInput, updateCourt } from '@/lib/services/courts.service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const input = parseCourtInput(await request.json())
    const court = await updateCourt(id, input)
    return NextResponse.json({ court })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteCourt(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
