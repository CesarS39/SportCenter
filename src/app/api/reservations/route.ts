import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { errorResponse } from '@/lib/api/respond'
import {
  createReservation,
  listActiveReservationsForCourtAndDate,
  listUserReservations,
} from '@/lib/services/reservations.service'

export async function GET(request: Request) {
  try {
    const user = await requireUser()
    const upcoming = new URL(request.url).searchParams.get('upcoming') === 'true'
    const reservations = await listUserReservations(user.id, { fromToday: upcoming })
    return NextResponse.json({ reservations })
  } catch (error) {
    return errorResponse(error)
  }
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { courtId, date, startTime, endTime } = await request.json()

    if (!courtId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const hoursUntil = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursUntil < 24) {
      return NextResponse.json(
        { error: 'Debes reservar con al menos 24 horas de anticipación' },
        { status: 400 }
      )
    }

    const existing = await listActiveReservationsForCourtAndDate(courtId, date)
    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)
    const overlaps = existing.some((r) => {
      const existingStart = timeToMinutes(r.startTime)
      const existingEnd = timeToMinutes(r.endTime)
      return newStart < existingEnd && newEnd > existingStart
    })

    if (overlaps) {
      return NextResponse.json({ error: 'El horario seleccionado ya no está disponible' }, { status: 409 })
    }

    const reservation = await createReservation({
      userId: user.id,
      courtId,
      date,
      startTime,
      endTime,
    })

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
