interface BucketableReservation {
  date: string
  startTime: string
  status: 'ACTIVE' | 'CANCELLED' | 'CANCELLED_ADMIN' | 'COMPLETED'
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

export function useReservationBuckets<T extends BucketableReservation>(reservations: T[]) {
  const active = reservations.filter((r) => r.status === 'ACTIVE')
  const past = reservations.filter((r) => r.status !== 'ACTIVE')
  const upcoming = active.filter((r) => new Date(`${r.date}T${r.startTime}`) > new Date())
  const today = active.filter((r) => isToday(r.date))
  const cancelled = reservations.filter((r) => r.status.includes('CANCELLED'))

  return { active, past, upcoming, today, cancelled }
}
