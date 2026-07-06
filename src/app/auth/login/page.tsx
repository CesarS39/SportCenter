'use client'

import Link from 'next/link'
import { useLogin } from '@/lib/hooks/use-login'
import { AuthHeader } from '@/components/auth/auth-header'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  const { email, setEmail, password, setPassword, loading, error, handleSubmit } = useLogin()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader subtitle="Inicia sesión en tu cuenta" />

        <LoginForm
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
