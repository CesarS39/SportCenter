import { prisma } from '@/lib/prisma'

export async function getAdminDashboardStats() {
  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date(`${todayStr}T00:00:00.000Z`)

  const [
    totalReservations,
    activeReservations,
    totalCourts,
    totalUsers,
    todayReservations,
    completedReservations,
  ] = await prisma.$transaction([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'ACTIVE' } }),
    prisma.court.count({ where: { active: true } }),
    prisma.userProfile.count(),
    prisma.reservation.count({ where: { date: today, status: 'ACTIVE' } }),
    prisma.reservation.findMany({
      where: { status: 'COMPLETED' },
      select: { court: { select: { pricePerHour: true } } },
    }),
  ])

  const revenue = completedReservations.reduce((total, r) => total + r.court.pricePerHour, 0)

  return {
    totalReservations,
    activeReservations,
    totalCourts,
    totalUsers,
    todayReservations,
    revenue,
  }
}
