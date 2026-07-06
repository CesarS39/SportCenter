import { prisma } from '@/lib/prisma'

export function listActiveCourts() {
  return prisma.court.findMany({
    where: { active: true },
    include: { sportType: true },
    orderBy: { name: 'asc' },
  })
}

export function listAllCourts() {
  return prisma.court.findMany({
    include: { sportType: true },
    orderBy: { createdAt: 'desc' },
  })
}

export interface CourtInput {
  name: string
  sportTypeId: string
  pricePerHour: number
  maxPeople: number
  imageUrl?: string | null
}

export function createCourt(data: CourtInput) {
  return prisma.court.create({
    data: {
      name: data.name,
      sportTypeId: data.sportTypeId,
      pricePerHour: data.pricePerHour,
      maxPeople: data.maxPeople,
      imageUrl: data.imageUrl || null,
      active: true,
    },
  })
}

export function updateCourt(id: string, data: CourtInput) {
  return prisma.court.update({
    where: { id },
    data: {
      name: data.name,
      sportTypeId: data.sportTypeId,
      pricePerHour: data.pricePerHour,
      maxPeople: data.maxPeople,
      imageUrl: data.imageUrl || null,
    },
  })
}

export async function toggleCourtActive(id: string) {
  const court = await prisma.court.findUniqueOrThrow({ where: { id } })
  return prisma.court.update({ where: { id }, data: { active: !court.active } })
}

export function deleteCourt(id: string) {
  return prisma.court.delete({ where: { id } })
}

export function parseCourtInput(body: unknown): CourtInput {
  const { name, sportTypeId, pricePerHour, maxPeople, imageUrl } = body as Record<string, unknown>

  if (!name || typeof name !== 'string') throw new Error('El nombre es obligatorio')
  if (!sportTypeId || typeof sportTypeId !== 'string') throw new Error('El tipo de deporte es obligatorio')

  const price = Number(pricePerHour)
  const people = Number(maxPeople)
  if (!Number.isFinite(price) || price <= 0) throw new Error('El precio por hora debe ser mayor a 0')
  if (!Number.isFinite(people) || people <= 0) throw new Error('El máximo de personas debe ser mayor a 0')

  return {
    name,
    sportTypeId,
    pricePerHour: price,
    maxPeople: people,
    imageUrl: typeof imageUrl === 'string' ? imageUrl : null,
  }
}
