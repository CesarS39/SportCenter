import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { apiFetch } from '@/lib/api/client'

export interface RegisterFormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const EMPTY_FORM: RegisterFormData = { name: '', email: '', phone: '', password: '', confirmPassword: '' }

export function useRegister() {
  const [formData, setFormData] = useState<RegisterFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        setError('Error al crear la cuenta: ' + authError.message)
        return
      }

      if (data.user) {
        try {
          await apiFetch('/api/auth/create-profile', {
            method: 'POST',
            body: JSON.stringify({ name: formData.name, phone: formData.phone }),
          })
        } catch (profileError) {
          const message = profileError instanceof Error ? profileError.message : 'Error desconocido'
          setError('Error al crear el perfil: ' + message)
          return
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
    } catch {
      setError('Error inesperado al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return { formData, handleChange, loading, error, success, handleSubmit }
}
