import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/generated/prisma/client'

export function getProfileByUserId(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } })
}

export function createProfile(data: { userId: string; name: string; phone?: string | null }) {
  // The `id` column has no reliable DB-level default, so it must be supplied here.
  return prisma.userProfile.create({
    data: {
      id: crypto.randomUUID(),
      userId: data.userId,
      name: data.name,
      phone: data.phone || null,
      role: 'USER',
    },
  })
}

export function isAdmin(role: UserRole | undefined) {
  return role === 'ADMIN'
}
