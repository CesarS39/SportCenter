import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordField } from '@/components/auth/password-field'
import { Loader2, Mail, User, Phone, ArrowRight } from 'lucide-react'
import type { RegisterFormData } from '@/lib/hooks/use-register'

interface RegisterFormProps {
  formData: RegisterFormData
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
}

export function RegisterForm({ formData, onChange, loading, error, onSubmit }: RegisterFormProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
        <p className="text-sm text-slate-500 mt-1">Completa tus datos para empezar a reservar</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-slate-700">
            Nombre completo
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Tu nombre completo"
              required
              disabled={loading}
              className="h-11 pl-10 rounded-xl bg-slate-50/60 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className="h-11 pl-10 rounded-xl bg-slate-50/60 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-slate-700">
            Teléfono
          </Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={onChange}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
              className="h-11 pl-10 rounded-xl bg-slate-50/60 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        <PasswordField id="password" label="Contraseña" value={formData.password} onChange={onChange} disabled={loading} />

        <PasswordField
          id="confirmPassword"
          label="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={onChange}
          disabled={loading}
          toggleable={false}
        />

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Crear Cuenta
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
