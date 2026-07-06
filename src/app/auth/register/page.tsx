'use client'

import Link from 'next/link'
import { useRegister } from '@/lib/hooks/use-register'
import { AuthHeader } from '@/components/auth/auth-header'
import { RegisterForm } from '@/components/auth/register-form'
import { RegisterSuccessCard } from '@/components/auth/register-success-card'

export default function RegisterPage() {
  const { formData, handleChange, loading, error, success, handleSubmit } = useRegister()

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <RegisterSuccessCard />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthHeader subtitle="Crea tu cuenta nueva" />

        <RegisterForm formData={formData} onChange={handleChange} loading={loading} error={error} onSubmit={handleSubmit} />

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
