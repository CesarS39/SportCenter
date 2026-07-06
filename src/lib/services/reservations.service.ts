import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

const RESERVATION_INCLUDE = {
  court: { include: { sportType: true } },
  user: true,
} as const

type ReservationWithRelations = Prisma.ReservationGetPayload<{ include: typeof RESERVATION_INCLUDE }>

function toDateOnly(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

function toTimeOnly(timeStr: string) {
  // timeStr like "14:00" or "14:00:00"
  const normalized = timeStr.length === 5 ? `${timeStr}:00` : timeStr
  return new Date(`1970-01-01T${normalized}.000Z`)
}

function formatDateOnly(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatTimeOnly(date: Date) {
  return date.toISOString().slice(11, 19)
}

function serializeReservation(reservation: ReservationWithRelations) {
  return {
    ...reservation,
    date: formatDateOnly(reservation.date),
    startTime: formatTimeOnly(reservation.startTime),
    endTime: formatTimeOnly(reservation.endTime),
  }
}

export async function listActiveReservationsForCourtAndDate(courtId: string, dateStr: string) {
  const reservations = await prisma.reservation.findMany({
    where: { courtId, date: toDateOnly(dateStr), status: 'ACTIVE' },
    select: { id: true, startTime: true, endTime: true, courtId: true },
  })

  return reservations.map((r) => ({
    ...r,
    startTime: formatTimeOnly(r.startTime),
    endTime: formatTimeOnly(r.endTime),
  }))
}

export interface CreateReservationInput {
  userId: string
  courtId: string
  date: string
  startTime: string
  endTime: string
}

export async function createReservation(input: CreateReservationInput) {
  const reservation = await prisma.reservation.create({
    data: {
      userId: input.userId,
      courtId: input.courtId,
      date: toDateOnly(input.date),
      startTime: toTimeOnly(input.startTime),
      endTime: toTimeOnly(input.endTime),
      status: 'ACTIVE',
    },
    include: RESERVATION_INCLUDE,
  })
  return serializeReservation(reservation)
}

export async function listUserReservations(userId: string, opts?: { fromToday?: boolean }) {
  const reservations = await prisma.reservation.findMany({
    where: {
      userId,
      ...(opts?.fromToday ? { date: { gte: toDateOnly(new Date().toISOString().split('T')[0]) } } : {}),
    },
    include: RESERVATION_INCLUDE,
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
  })
  return reservations.map(serializeReservation)
}

export async function cancelUserReservation(reservationId: string, userId: string) {
  const reservation = await prisma.reservation.findUniqueOrThrow({ where: { id: reservationId } })

  if (reservation.userId !== userId) {
    throw new Error('FORBIDDEN')
  }
  if (reservation.status !== 'ACTIVE') {
    throw new Error('NOT_ACTIVE')
  }

  const reservationDateTime = new Date(
    `${formatDateOnly(reservation.date)}T${formatTimeOnly(reservation.startTime)}`
  )
  const hoursUntil = (reservationDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
  if (hoursUntil < 2) {
    throw new Error('TOO_LATE')
  }

  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED', penaltyApplied: true },
    include: RESERVATION_INCLUDE,
  })
  return serializeReservation(updated)
}

export async function listAllReservations() {
  const reservations = await prisma.reservation.findMany({
    include: RESERVATION_INCLUDE,
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
  })
  return reservations.map(serializeReservation)
}

export async function listRecentReservations(limit: number) {
  const reservations = await prisma.reservation.findMany({
    include: RESERVATION_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return reservations.map(serializeReservation)
}

export async function cancelReservationAsAdmin(reservationId: string) {
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED_ADMIN', penaltyApplied: false },
    include: RESERVATION_INCLUDE,
  })
  return serializeReservation(updated)
}

export async function completeReservation(reservationId: string) {
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'COMPLETED' },
    include: RESERVATION_INCLUDE,
  })
  return serializeReservation(updated)
}
