import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { getSportIcon } from '@/lib/sport-icons'
import { formatDate } from '@/lib/utils'
import type { Court } from '@/lib/hooks/use-courts'

interface TimeSelectorStepProps {
  selectedCourt: Court
  selectedDate: Date
  duration: 1 | 2
  onChangeDuration: (duration: 1 | 2) => void
  availableSlots: string[]
  selectedTimeSlot: string | null
  onSelectTimeSlot: (slot: string) => void
  canSelectTimeSlot: (slot: string) => boolean
  onChangeDate: () => void
  onConfirm: () => void
  submitting: boolean
}

export function TimeSelectorStep({
  selectedCourt,
  selectedDate,
  duration,
  onChangeDuration,
  availableSlots,
  selectedTimeSlot,
  onSelectTimeSlot,
  canSelectTimeSlot,
  onChangeDate,
  onConfirm,
  submitting,
}: TimeSelectorStepProps) {
  const endTime = selectedTimeSlot
    ? (() => {
        const [startHour, startMinute] = selectedTimeSlot.split(':').map(Number)
        const endHour = startHour + duration
        return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
      })()
    : null

  return (
    <Card className="rounded-2xl border-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              Seleccionar Horario
            </CardTitle>
            <CardDescription>Elige la hora y duración</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeDate} className="rounded-lg">
            Cambiar fecha
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getSportIcon(selectedCourt.sportType.name)}</span>
            <div>
              <p className="font-medium text-emerald-800">{selectedCourt.name}</p>
              <p className="text-sm text-emerald-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Duración</label>
          <div className="grid grid-cols-2 gap-3">
            <Button variant={duration === 1 ? 'default' : 'outline'} onClick={() => onChangeDuration(1)} className="h-12 rounded-xl">
              1 hora
              <div className="text-xs text-muted-foreground ml-2">${selectedCourt.pricePerHour}</div>
            </Button>
            <Button variant={duration === 2 ? 'default' : 'outline'} onClick={() => onChangeDuration(2)} className="h-12 rounded-xl">
              2 horas
              <div className="text-xs text-muted-foreground ml-2">${selectedCourt.pricePerHour * 2}</div>
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Horarios Disponibles</label>
          {availableSlots.length === 0 ? (
            <Alert>
              <CalendarIcon className="h-4 w-4" />
              <AlertDescription>No hay horarios disponibles para esta fecha.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTimeSlot === slot ? 'default' : 'outline'}
                  onClick={() => onSelectTimeSlot(slot)}
                  disabled={!canSelectTimeSlot(slot)}
                  className="h-12 text-sm rounded-xl"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>

        {selectedTimeSlot && (
          <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Cancha:</span>
                  <span>{selectedCourt.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha:</span>
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Hora:</span>
                  <span>
                    {selectedTimeSlot} - {endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duración:</span>
                  <span>
                    {duration} hora{duration > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Total:</span>
                  <span className="text-emerald-600">${selectedCourt.pricePerHour * duration}</span>
                </div>
              </div>

              <Button className="w-full h-12 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" onClick={onConfirm} disabled={submitting}>
                Confirmar Reserva
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
