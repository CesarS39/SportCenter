import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { createProfile } from '@/lib/services/profile.service'

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { name, phone } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const profile = await createProfile({ userId: user.id, name, phone })
    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
