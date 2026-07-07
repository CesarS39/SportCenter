import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Calendar, LogOut, Menu, Plus, Settings, User } from 'lucide-react'
import type { Profile } from '@/lib/hooks/use-profile'
import { getInitials } from '@/lib/utils'

interface DashboardMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | undefined
  onLogout: () => void
}

export function DashboardMenuSheet({ open, onOpenChange, profile, onLogout }: DashboardMenuSheetProps) {
  const initials = profile?.name ? getInitials(profile.name) : 'U'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] max-w-[calc(100vw-2rem)]">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-emerald-100">
              <AvatarFallback className="bg-emerald-50 text-emerald-600 text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-left">{profile?.name || 'Usuario'}</SheetTitle>
              <SheetDescription className="text-left">
                {profile?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div className="space-y-2">
            <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl">
              <Link href="/reservas" onClick={() => onOpenChange(false)}>
                <Plus className="h-5 w-5 mr-3" />
                Nueva Reserva
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl">
              <Link href="/reservas/mis-reservas" onClick={() => onOpenChange(false)}>
                <Calendar className="h-5 w-5 mr-3" />
                Mis Reservas
              </Link>
            </Button>

            {profile?.role === 'ADMIN' && (
              <Button variant="ghost" asChild className="w-full justify-start h-12 rounded-xl">
                <Link href="/admin" onClick={() => onOpenChange(false)}>
                  <Settings className="h-5 w-5 mr-3" />
                  Panel Admin
                </Link>
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>{profile?.phone || 'Sin teléfono'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
