import Link from 'next/link'
import { Trophy, ShieldCheck, CalendarClock, Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}

const highlights = [
  { icon: CalendarClock, text: 'Reserva tu cancha en menos de 30 segundos' },
  { icon: ShieldCheck, text: 'Pagos y datos protegidos de principio a fin' },
  { icon: Sparkles, text: 'Canchas premium con disponibilidad en vivo' },
]

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left branding panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-mesh-emerald bg-slate-900 p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/60" />

        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <Trophy className="h-6 w-6 text-emerald-300" />
          </span>
          <div>
            <p className="text-lg font-bold leading-none">SportCenter</p>
            <p className="text-[11px] tracking-widest text-emerald-200/80 font-medium">CLUB DEPORTIVO PREMIUM</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-white/15 mb-6">
            {eyebrow}
          </span>
          <h2 className="text-4xl font-bold leading-tight mb-4 text-balance">{title}</h2>
          <p className="text-slate-200/90 text-base leading-relaxed">{subtitle}</p>
        </div>

        <div className="relative z-10 space-y-4">
          {highlights.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-100/90">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                <Icon className="h-4 w-4 text-emerald-300" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <Trophy className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold text-slate-900">SportCenter</span>
          </Link>

          {children}

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
