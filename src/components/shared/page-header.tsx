import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  backHref?: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, backHref, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center min-w-0 flex-1">
            {backHref && (
              <Button variant="ghost" asChild className="mr-2 p-2 h-auto">
                <Link href={backHref}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Trophy className="h-6 w-6 text-green-600 mr-2 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs text-gray-600 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
