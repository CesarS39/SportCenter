import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TINTS = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  yellow: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
} as const

interface StatCardProps {
  icon: LucideIcon
  tint?: keyof typeof TINTS
  label: string
  value: string | number
  compact?: boolean
}

export function StatCard({ icon: Icon, tint = 'emerald', label, value, compact = false }: StatCardProps) {
  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className={compact ? 'p-3 sm:p-4 lg:p-5' : 'p-5'}>
        <div className="flex items-center">
          <div className={cn('flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl', TINTS[tint])}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="ml-3 sm:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
