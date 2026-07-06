import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  iconClassName?: string
  label: string
  value: string | number
  compact?: boolean
}

export function StatCard({ icon: Icon, iconClassName, label, value, compact = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className={compact ? 'p-3 sm:p-4 lg:p-6' : 'p-6'}>
        <div className="flex items-center">
          <Icon className={cn('h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0', iconClassName)} />
          <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
