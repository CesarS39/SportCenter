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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between items-center py-3.5">
          <div className="flex items-center min-w-0 flex-1">
            {backHref && (
              <Button variant="ghost" asChild className="mr-1 p-2 h-auto rounded-full">
                <Link href={backHref}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 mr-2.5 flex-shrink-0">
              <Trophy className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  )
}
