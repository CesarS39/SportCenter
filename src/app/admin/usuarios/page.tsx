'use client'

import { useState } from 'react'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { useAdminUserMutations, useAdminUsers, type AdminUser, type UserFormInput } from '@/lib/hooks/use-admin-users'
import { UserRowCard } from '@/components/admin/usuarios/user-row-card'
import { UserEditDialog } from '@/components/admin/usuarios/user-edit-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FullscreenLoader } from '@/components/shared/fullscreen-loader'
import { PageHeader } from '@/components/shared/page-header'
import { Search, Users, Crown, User, Activity, RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsuariosPage() {
  const { user, isLoading: isAdminLoading } = useRequireAdmin()
  const { data: users = [], isLoading: isUsersLoading, refetch } = useAdminUsers(!isAdminLoading)
  const { updateUser, deleteUser, toggleRole } = useAdminUserMutations()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const currentUserId = user?.id || ''
  const loading = isAdminLoading || isUsersLoading

  const filteredUsers = users.filter((u) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!u.name.toLowerCase().includes(term) && !u.phone?.toLowerCase().includes(term)) {
        return false
      }
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    return true
  })

  const openEditDialog = (target: AdminUser) => {
    setEditingUser(target)
    setShowEditDialog(true)
  }

  const handleSubmit = (input: UserFormInput) => {
    if (!editingUser) return
    const loadingToast = toast.loading('Actualizando usuario...')
    updateUser.mutate(
      { id: editingUser.id, input },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast)
          toast.success('Usuario actualizado exitosamente')
          setShowEditDialog(false)
        },
        onError: () => {
          toast.dismiss(loadingToast)
          toast.error('Error al actualizar el usuario')
        },
      }
    )
  }

  const handleDeleteUser = (target: AdminUser) => {
    const loadingToast = toast.loading('Eliminando usuario...')
    deleteUser.mutate(target.id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success('Usuario eliminado exitosamente')
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al eliminar el usuario')
      },
    })
  }

  const handleToggleRole = (target: AdminUser) => {
    const newRole = target.role === 'ADMIN' ? 'USER' : 'ADMIN'
    const loadingToast = toast.loading(`Cambiando rol a ${newRole}...`)
    toggleRole.mutate(target.id, {
      onSuccess: () => {
        toast.dismiss(loadingToast)
        toast.success(`Usuario ${newRole === 'ADMIN' ? 'promovido a' : 'degradado a'} ${newRole}`)
      },
      onError: () => {
        toast.dismiss(loadingToast)
        toast.error('Error al cambiar el rol')
      },
    })
  }

  if (loading) {
    return <FullscreenLoader message="Cargando gestión de usuarios..." />
  }

  const adminUsers = users.filter((u) => u.role === 'ADMIN').length
  const regularUsers = users.filter((u) => u.role === 'USER').length
  const activeUsers = users.filter((u) => u.activeReservations > 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Gestión de Usuarios"
        backHref="/admin"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="USER">Usuarios</SelectItem>
                  <SelectItem value="ADMIN">Administradores</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('all')
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} iconClassName="text-blue-600" label="Total Usuarios" value={users.length} />
          <StatCard icon={Crown} iconClassName="text-purple-600" label="Administradores" value={adminUsers} />
          <StatCard icon={User} iconClassName="text-green-600" label="Usuarios Regulares" value={regularUsers} />
          <StatCard icon={Activity} iconClassName="text-orange-600" label="Con Reservas Activas" value={activeUsers} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Gestiona todos los usuarios registrados en el sistema ({filteredUsers.length} mostrados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No se encontraron usuarios"
                description="Ajusta los filtros para ver más resultados"
              />
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((target) => (
                  <UserRowCard
                    key={target.id}
                    user={target}
                    isCurrentUser={target.userId === currentUserId}
                    onEdit={openEditDialog}
                    onToggleRole={handleToggleRole}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <UserEditDialog
          key={editingUser?.id ?? 'none'}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          editingUser={editingUser}
          currentUserId={currentUserId}
          submitting={updateUser.isPending}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  )
}
