import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import { getAdminDashboardStats } from '@/lib/services/stats.service'
import { listRecentReservations } from '@/lib/services/reservations.service'
import { listRecentUsers } from '@/lib/services/users.service'

export async function GET() {
  try {
    await requireAdmin()
    const [stats, recentReservations, recentUsers] = await Promise.all([
      getAdminDashboardStats(),
      listRecentReservations(10),
      listRecentUsers(10),
    ])
    return NextResponse.json({ stats, recentReservations, recentUsers })
  } catch (error) {
    return errorResponse(error)
  }
}
