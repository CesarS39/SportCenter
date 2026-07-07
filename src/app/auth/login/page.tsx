'use client'

import { useLogin } from '@/lib/hooks/use-login'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const { email, setEmail, password, setPassword, loading, error, handleSubmit } = useLogin()

  return (
    <AuthLayout
      eyebrow="Acceso de miembros"
      title="Tu cancha te está esperando."
      subtitle="Ingresa a tu cuenta para gestionar tus reservas, ver tu historial y asegurar tu próximo partido en segundos."
    >
      <LoginForm
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  )
}
