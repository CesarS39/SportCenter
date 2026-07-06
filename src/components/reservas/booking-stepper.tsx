import { CheckCircle2 } from 'lucide-react'
import type { Court } from '@/lib/hooks/use-courts'

interface BookingStepperProps {
  currentStep: number
  selectedCourt: Court | null
  selectedDate: Date | undefined
  selectedTimeSlot: string | null
}

const STEPS = [
  { step: 1, label: 'Cancha' },
  { step: 2, label: 'Fecha' },
  { step: 3, label: 'Horario' },
]

export function BookingStepper({ currentStep, selectedCourt, selectedDate, selectedTimeSlot }: BookingStepperProps) {
  const isDone = (step: number) => (step === 1 ? !!selectedCourt : step === 2 ? !!selectedDate : !!selectedTimeSlot)

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-center space-x-4">
        {STEPS.map(({ step, label }, index) => (
          <div key={step} className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-green-600' : 'text-gray-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                {isDone(step) ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {index < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  )
}
