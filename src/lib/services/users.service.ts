import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma/client'

export async function listUsersWithStats() {
  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reservations: {
        select: { status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return users.map(({ reservations, ...profile }) => ({
    ...profile,
    totalReservations: reservations.length,
    activeReservations: reservations.filter((r) => r.status === 'ACTIVE').length,
    completedReservations: reservations.filter((r) => r.status === 'COMPLETED').length,
    cancelledReservations: reservations.filter((r) => r.status.includes('CANCELLED')).length,
    lastActivity: reservations[0]?.createdAt ?? null,
  }))
}

export function getUserProfileById(id: string) {
  return prisma.userProfile.findUniqueOrThrow({ where: { id } })
}

export function listRecentUsers(limit: number) {
  return prisma.userProfile.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
}

export interface UpdateUserInput {
  name: string
  phone: string | null
  role: UserRole
}

export function updateUser(id: string, data: UpdateUserInput) {
  return prisma.userProfile.update({
    where: { id },
    data: { name: data.name.trim(), phone: data.phone?.trim() || null, role: data.role },
  })
}

export function deleteUser(id: string) {
  return prisma.userProfile.delete({ where: { id } })
}

export async function toggleUserRole(id: string) {
  const user = await prisma.userProfile.findUniqueOrThrow({ where: { id } })
  const newRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  return prisma.userProfile.update({ where: { id }, data: { role: newRole } })
}
