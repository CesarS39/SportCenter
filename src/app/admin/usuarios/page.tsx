'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRequireAdmin } from '@/lib/hooks/use-require-admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Trophy,
  ArrowLeft,
  Search,
  Users,
  Edit,
  Trash2,
  Shield,
  User,
  Phone,
  Calendar,
  Activity,
  Crown,
  RefreshCw,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  user_id: string
  name: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  created_at: string
}

interface UserWithStats extends UserProfile {
  email?: string
  totalReservations: number
  activeReservations: number
  completedReservations: number
  cancelledReservations: number
  lastActivity: string | null
}

interface FormData {
  name: string
  phone: string
  role: 'USER' | 'ADMIN'
}

export default function AdminUsuariosPage() {
  const { user, isLoading: isAdminLoading } = useRequireAdmin()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    role: 'USER'
  })

  const currentUserId = user?.id || ''

  const { data: users = [], isLoading: isUsersLoading, refetch } = useQuery({
    queryKey: ['admin-users-with-stats'],
    queryFn: async () => {
      // Cargar todos los usuarios con estadísticas
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        toast.error('Error al cargar los usuarios')
        throw usersError
      }

      // Enriquecer datos de usuarios con estadísticas de reservas
      const usersWithStats = await Promise.all(
        (usersData || []).map(async (userProfile) => {
          // Obtener estadísticas de reservas
          const { data: reservations } = await supabase
            .from('reservations')
            .select('status, created_at')
            .eq('user_id', userProfile.user_id)

          const totalReservations = reservations?.length || 0
          const activeReservations = reservations?.filter(r => r.status === 'ACTIVE').length || 0
          const completedReservations = reservations?.filter(r => r.status === 'COMPLETED').length || 0
          const cancelledReservations = reservations?.filter(r => r.status.includes('CANCELLED')).length || 0
          const lastActivity = reservations && reservations.length > 0
            ? reservations[0].created_at
            : null

          // Nota: En producción, el email podría no estar disponible por privacidad
          const email = 'Email no disponible'

          return {
            ...userProfile,
            email,
            totalReservations,
            activeReservations,
            completedReservations,
            cancelledReservations,
            lastActivity
          }
        })
      )

      return usersWithStats as UserWithStats[]
    },
    enabled: !isAdminLoading,
  })

  const loading = isAdminLoading || isUsersLoading

  // Aplicar filtros de forma derivada (sin estado ni efectos)
  const filteredUsers = users.filter((u) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (
        !u.name.toLowerCase().includes(term) &&
        !u.phone?.toLowerCase().includes(term) &&
        !u.email?.toLowerCase().includes(term)
      ) {
        return false
      }
    }
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    return true
  })

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['admin-users-with-stats'] })

  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; phone: string; role: 'USER' | 'ADMIN' }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: data.name.trim(),
          phone: data.phone.trim() || null,
          role: data.role
        })
        .eq('id', data.id)

      if (error) throw error
    },
    onMutate: () => {
      return { loadingToast: toast.loading('Actualizando usuario...', {
        description: 'Por favor espera un momento'
      }) }
    },
    onSuccess: (_data, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success('Usuario actualizado exitosamente')
      setShowEditDialog(false)
      setEditingUser(null)
      invalidateUsers()
    },
    onError: (error, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      console.error('Error updating user:', error)
      toast.error('Error al actualizar el usuario')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (targetUser: UserProfile) => {
      // Nota: en un sistema real, también deberías eliminar el usuario de Auth,
      // pero eso requiere privilegios de admin de Supabase
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', targetUser.id)

      if (error) throw error
    },
    onMutate: () => {
      return { loadingToast: toast.loading('Eliminando usuario...', {
        description: 'Por favor espera un momento'
      }) }
    },
    onSuccess: (_data, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success('Usuario eliminado exitosamente')
      invalidateUsers()
    },
    onError: (error, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar el usuario')
    },
  })

  const toggleRoleMutation = useMutation({
    mutationFn: async (targetUser: UserProfile) => {
      const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id)

      if (error) throw error
      return newRole
    },
    onMutate: (targetUser) => {
      const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN'
      return { loadingToast: toast.loading(`Cambiando rol a ${newRole}...`, {
        description: 'Por favor espera un momento'
      }) }
    },
    onSuccess: (newRole, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success(`Usuario ${newRole === 'ADMIN' ? 'promovido a' : 'degradado a'} ${newRole}`)
      invalidateUsers()
    },
    onError: (error, _vars, context) => {
      toast.dismiss(context?.loadingToast)
      console.error('Error toggling role:', error)
      toast.error('Error al cambiar el rol')
    },
  })

  const submitting = updateUserMutation.isPending

  const openEditDialog = (user: UserProfile) => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      role: user.role
    })
    setEditingUser(user)
    setShowEditDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    // Validaciones
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    updateUserMutation.mutate({
      id: editingUser.id,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
    })
  }

  const handleDeleteUser = (targetUser: UserProfile) => {
    if (targetUser.user_id === currentUserId) {
      toast.error('No puedes eliminarte a ti mismo')
      return
    }

    deleteUserMutation.mutate(targetUser)
  }

  const handleToggleRole = (targetUser: UserProfile) => {
    if (targetUser.user_id === currentUserId) {
      toast.error('No puedes cambiar tu propio rol')
      return
    }

    toggleRoleMutation.mutate(targetUser)
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Estadísticas
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.role === 'ADMIN').length
  const regularUsers = users.filter(u => u.role === 'USER').length
  const activeUsers = users.filter(u => u.activeReservations > 0).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando gestión de usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Panel
                </Link>
              </Button>
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda y Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por rol */}
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

              {/* Botón limpiar */}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Regulares</p>
                  <p className="text-2xl font-bold text-gray-900">{regularUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Con Reservas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Gestiona todos los usuarios registrados en el sistema ({filteredUsers.length} mostrados)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-600">Ajusta los filtros para ver más resultados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={`${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} font-semibold`}>
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{user.name}</h3>
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
                              {user.user_id === currentUserId && (
                                <Badge variant="outline">Tú</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {user.phone || 'Sin teléfono'}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Registrado: {formatDate(user.created_at)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>Total reservas: {user.totalReservations}</span>
                              <span>Activas: {user.activeReservations}</span>
                              <span>Completadas: {user.completedReservations}</span>
                              {user.cancelledReservations > 0 && (
                                <span className="text-red-500">Canceladas: {user.cancelledReservations}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          
                          {user.user_id !== currentUserId && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleRole(user)}
                                className={user.role === 'ADMIN' ? 'text-orange-600 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700'}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                {user.role === 'ADMIN' ? 'Degradar' : 'Promover'}
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Se eliminará permanentemente el usuario <strong>{user.name}</strong> y todos sus datos asociados.
                                      <br /><br />
                                      <strong>Reservas del usuario: {user.totalReservations}</strong>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica la información del usuario
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'USER' | 'ADMIN') => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={editingUser?.user_id === currentUserId}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario Regular</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {editingUser?.user_id === currentUserId && (
                  <p className="text-xs text-gray-500">No puedes cambiar tu propio rol</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}