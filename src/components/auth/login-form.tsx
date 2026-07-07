import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordField } from '@/components/auth/password-field'
import { Loader2, Mail, ArrowRight } from 'lucide-react'

interface LoginFormProps {
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
}

export function LoginForm({ email, onEmailChange, password, onPasswordChange, loading, error, onSubmit }: LoginFormProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Bienvenido de nuevo</h1>
        <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para acceder a tu cuenta</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className="h-11 pl-10 rounded-xl bg-slate-50/60 border-slate-200 focus-visible:bg-white"
            />
          </div>
        </div>

        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          ¿No tienes una cuenta?{' '}
          <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
