import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId } from '@/lib/services/profile.service'

export class UnauthorizedError extends Error {
  constructor(message = 'No autenticado') {
    super(message)
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'No autorizado') {
    super(message)
  }
}

export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) throw new UnauthorizedError()
  return user
}

export async function requireProfile() {
  const user = await requireUser()
  const profile = await getProfileByUserId(user.id)
  if (!profile) throw new UnauthorizedError('Perfil no encontrado')
  return { user, profile }
}

export async function requireAdmin() {
  const { user, profile } = await requireProfile()
  if (profile.role !== 'ADMIN') throw new ForbiddenError()
  return { user, profile }
}
