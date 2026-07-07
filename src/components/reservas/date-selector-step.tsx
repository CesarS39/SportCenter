import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon } from 'lucide-react'
import { getSportIcon } from '@/lib/sport-icons'
import { formatDate, isOperatingDay } from '@/lib/utils'
import type { Court } from '@/lib/hooks/use-courts'

interface DateSelectorStepProps {
  selectedCourt: Court
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  onChangeCourt: () => void
}

export function DateSelectorStep({ selectedCourt, selectedDate, onSelectDate, onChangeCourt }: DateSelectorStepProps) {
  return (
    <Card className="rounded-2xl border-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              Seleccionar Fecha
            </CardTitle>
            <CardDescription>Elige el día para tu reserva</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeCourt} className="rounded-lg">
            Cambiar cancha
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getSportIcon(selectedCourt.sportType.name)}</span>
            <div>
              <p className="font-medium text-emerald-800">{selectedCourt.name}</p>
              <p className="text-sm text-emerald-600">${selectedCourt.pricePerHour}/hora</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onSelectDate}
              disabled={(date) => {
                const today = new Date()
                const tomorrow = new Date()
                tomorrow.setDate(today.getDate() + 1)
                return date < tomorrow || !isOperatingDay(date)
              }}
              className="rounded-xl border border-slate-100 shadow-sm bg-white mx-auto"
              classNames={{
                months: 'flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center',
                month: 'space-y-4 w-full flex flex-col',
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: '',
                weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center',
                week: 'flex w-full mt-2',
                day: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
                day_button:
                  'h-8 w-8 p-0 font-normal aria-selected:opacity-100 mx-auto rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'bg-accent text-accent-foreground',
                outside: 'day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                disabled: 'text-muted-foreground opacity-50',
                hidden: 'invisible',
              }}
            />
          </div>

          {!selectedDate && (
            <Alert className="mx-4">
              <CalendarIcon className="h-4 w-4" />
              <AlertDescription>
                Selecciona una fecha para continuar con tu reserva. Solo puedes reservar con 24 horas de anticipación.
              </AlertDescription>
            </Alert>
          )}

          {selectedDate && (
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-medium text-blue-800">Fecha seleccionada: {formatDate(selectedDate)}</p>
              <p className="text-xs text-blue-600 mt-1">Continuemos con la selección de horario</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
