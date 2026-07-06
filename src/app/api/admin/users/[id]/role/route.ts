import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { getUserProfileById, toggleUserRole } from '@/lib/services/users.service'

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params

    const target = await getUserProfileById(id)
    if (target.userId === user.id) {
      return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 400 })
    }

    const updated = await toggleUserRole(id)
    return NextResponse.json({ user: updated })
  } catch (error) {
    return errorResponse(error)
  }
}
