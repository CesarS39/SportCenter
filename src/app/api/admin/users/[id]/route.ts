import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { deleteUser, getUserProfileById, updateUser } from '@/lib/services/users.service'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params
    const { name, phone, role } = await request.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const target = await getUserProfileById(id)
    const isSelf = target.userId === user.id
    const nextRole = isSelf ? target.role : role

    const updated = await updateUser(id, { name, phone: phone ?? null, role: nextRole })
    return NextResponse.json({ user: updated })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireAdmin()
    const { id } = await params

    const target = await getUserProfileById(id)
    if (target.userId === user.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
    }

    await deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
