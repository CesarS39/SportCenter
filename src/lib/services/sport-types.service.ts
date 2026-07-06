import { prisma } from '@/lib/prisma'

export function listSportTypes() {
  return prisma.sportType.findMany({ orderBy: { name: 'asc' } })
}
