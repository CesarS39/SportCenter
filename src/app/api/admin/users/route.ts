import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { listUsersWithStats } from '@/lib/services/users.service'

export async function GET() {
  try {
    await requireAdmin()
    const users = await listUsersWithStats()
    return NextResponse.json({ users })
  } catch (error) {
    return errorResponse(error)
  }
}
