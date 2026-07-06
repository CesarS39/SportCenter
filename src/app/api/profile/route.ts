import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { getProfileByUserId } from '@/lib/services/profile.service'

export async function GET() {
  try {
    const user = await requireUser()
    const profile = await getProfileByUserId(user.id)
    return NextResponse.json({ profile })
  } catch (error) {
    return errorResponse(error)
  }
}
