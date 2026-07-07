import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Calendar, Crown, Edit, Phone, Shield, Trash2, User } from 'lucide-react'
import type { AdminUser } from '@/lib/hooks/use-admin-users'
import { getInitials } from '@/lib/utils'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface UserRowCardProps {
  user: AdminUser
  isCurrentUser: boolean
  onEdit: (user: AdminUser) => void
  onToggleRole: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

export function UserRowCard({ user, isCurrentUser, onEdit, onToggleRole, onDelete }: UserRowCardProps) {
  return (
    <Card className="rounded-2xl border-slate-100 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-slate-50">
              <AvatarFallback
                className={`${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'} font-semibold`}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role === 'ADMIN' ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      ADMIN
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      USER
                    </>
                  )}
                </Badge>
                {isCurrentUser && <Badge variant="outline">Tú</Badge>}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone || 'Sin teléfono'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Registrado: {formatDate(user.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Total reservas: {user.totalReservations}</span>
                <span>Activas: {user.activeReservations}</span>
                <span>Completadas: {user.completedReservations}</span>
                {user.cancelledReservations > 0 && (
                  <span className="text-red-500">Canceladas: {user.cancelledReservations}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="rounded-lg">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>

            {!isCurrentUser && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleRole(user)}
                  className={`rounded-lg ${user.role === 'ADMIN' ? 'text-orange-600 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  {user.role === 'ADMIN' ? 'Degradar' : 'Promover'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{' '}
                        <strong>{user.name}</strong> y todos sus datos asociados.
                        <br />
                        <br />
                        <strong>Reservas del usuario: {user.totalReservations}</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(user)} className="bg-red-600 hover:bg-red-700">
                        Eliminar usuario
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
