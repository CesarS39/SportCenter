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
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 sticky top-[57px] z-30">
      <div className="flex items-center justify-center space-x-4">
        {STEPS.map(({ step, label }, index) => (
          <div key={step} className="flex items-center space-x-4">
            <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${currentStep >= step ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}
              >
                {isDone(step) ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span className="text-sm font-medium hidden sm:block">{label}</span>
            </div>
            {index < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-100" />}
          </div>
        ))}
      </div>
    </div>
  )
}
