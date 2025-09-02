import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas que requieren autenticación
  const protectedRoutes = ['/reservas', '/admin', '/dashboard']
  const adminRoutes = ['/admin']
  const authRoutes = ['/auth/login', '/auth/register']

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Si no está autenticado y trata de acceder a rutas protegidas
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Si está autenticado y trata de acceder a auth pages
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Verificar permisos de admin
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}