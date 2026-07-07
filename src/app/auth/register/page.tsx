'use client'

import { useRegister } from '@/lib/hooks/use-register'
import { AuthLayout } from '@/components/auth/auth-layout'
import { RegisterForm } from '@/components/auth/register-form'
import { RegisterSuccessCard } from '@/components/auth/register-success-card'

export default function RegisterPage() {
  const { formData, handleChange, loading, error, success, handleSubmit } = useRegister()

  if (success) {
    return (
      <div className="min-h-screen bg-mesh-emerald bg-slate-900 flex items-center justify-center p-4">
        <RegisterSuccessCard />
      </div>
    )
  }

  return (
    <AuthLayout
      eyebrow="Únete al club"
      title="Reservas ilimitadas, cero fricción."
      subtitle="Crea tu cuenta gratis y desbloquea reservas online 24/7, confirmación instantánea y acceso a todas nuestras canchas premium."
    >
      <RegisterForm formData={formData} onChange={handleChange} loading={loading} error={error} onSubmit={handleSubmit} />
    </AuthLayout>
  )
}
