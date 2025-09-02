'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Trophy, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Users,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface SportType {
  id: string
  name: string
  description: string | null
  max_people: number
}

interface Court {
  id: string
  name: string
  sport_type_id: string
  price_per_hour: number
  max_people: number
  image_url: string | null
  active: boolean
  created_at: string
  sport_type: SportType
}

interface FormData {
  name: string
  sport_type_id: string
  price_per_hour: string
  max_people: string
  image_url: string
}

export default function AdminCanchasPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sport_type_id: '',
    price_per_hour: '',
    max_people: '',
    image_url: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Verificar permisos de admin
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }

      // Cargar canchas
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select(`
          *,
          sport_type:sport_types (
            id,
            name,
            description,
            max_people
          )
        `)
        .order('created_at', { ascending: false })

      if (courtsError) {
        console.error('Error loading courts:', courtsError)
        toast.error('Error al cargar las canchas')
      } else {
        setCourts(courtsData || [])
      }

      // Cargar tipos de deportes
      const { data: sportTypesData, error: sportTypesError } = await supabase
        .from('sport_types')
        .select('*')
        .order('name')

      if (sportTypesError) {
        console.error('Error loading sport types:', sportTypesError)
        toast.error('Error al cargar los tipos de deportes')
      } else {
        setSportTypes(sportTypesData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sport_type_id: '',
      price_per_hour: '',
      max_people: '',
      image_url: ''
    })
    setEditingCourt(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const openEditDialog = (court: Court) => {
    setFormData({
      name: court.name,
      sport_type_id: court.sport_type_id,
      price_per_hour: court.price_per_hour.toString(),
      max_people: court.max_people.toString(),
      image_url: court.image_url || ''
    })
    setEditingCourt(court)
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validaciones
    if (!formData.name || !formData.sport_type_id || !formData.price_per_hour || !formData.max_people) {
      toast.error('Por favor completa todos los campos obligatorios')
      setSubmitting(false)
      return
    }

    const pricePerHour = parseFloat(formData.price_per_hour)
    const maxPeople = parseInt(formData.max_people)

    if (isNaN(pricePerHour) || pricePerHour <= 0) {
      toast.error('El precio por hora debe ser un número válido mayor a 0')
      setSubmitting(false)
      return
    }

    if (isNaN(maxPeople) || maxPeople <= 0) {
      toast.error('El número máximo de personas debe ser un número válido mayor a 0')
      setSubmitting(false)
      return
    }

    const loadingToast = toast.loading(
      editingCourt ? 'Actualizando cancha...' : 'Creando cancha...',
      { description: 'Por favor espera un momento' }
    )

    try {
      if (editingCourt) {
        // Actualizar cancha existente
        const { error } = await supabase
          .from('courts')
          .update({
            name: formData.name,
            sport_type_id: formData.sport_type_id,
            price_per_hour: pricePerHour,
            max_people: maxPeople,
            image_url: formData.image_url || null
          })
          .eq('id', editingCourt.id)

        if (error) {
          throw error
        }

        toast.success('Cancha actualizada exitosamente')
      } else {
        // Crear nueva cancha
        const courtId = 'court_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

        const { error } = await supabase
          .from('courts')
          .insert({
            id: courtId,
            name: formData.name,
            sport_type_id: formData.sport_type_id,
            price_per_hour: pricePerHour,
            max_people: maxPeople,
            image_url: formData.image_url || null,
            active: true
          })

        if (error) {
          throw error
        }

        toast.success('Cancha creada exitosamente')
      }

      toast.dismiss(loadingToast)
      setShowDialog(false)
      resetForm()
      await loadData() // Recargar la lista
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Error saving court:', error)
      toast.error('Error al guardar la cancha', {
        description: error.message
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (court: Court) => {
    const loadingToast = toast.loading(
      `${court.active ? 'Desactivando' : 'Activando'} cancha...`,
      { description: 'Por favor espera un momento' }
    )

    try {
      const { error } = await supabase
        .from('courts')
        .update({ active: !court.active })
        .eq('id', court.id)

      toast.dismiss(loadingToast)

      if (error) {
        throw error
      }

      toast.success(
        `Cancha ${court.active ? 'desactivada' : 'activada'} exitosamente`
      )

      await loadData()
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Error toggling court status:', error)
      toast.error('Error al cambiar el estado de la cancha', {
        description: error.message
      })
    }
  }

  const handleDelete = async (court: Court) => {
    const loadingToast = toast.loading('Eliminando cancha...', {
      description: 'Por favor espera un momento'
    })

    try {
      const { error } = await supabase
        .from('courts')
        .delete()
        .eq('id', court.id)

      toast.dismiss(loadingToast)

      if (error) {
        throw error
      }

      toast.success('Cancha eliminada exitosamente')
      await loadData()
    } catch (error: any) {
      toast.dismiss(loadingToast)
      console.error('Error deleting court:', error)
      toast.error('Error al eliminar la cancha', {
        description: error.message
      })
    }
  }

  const getSportIcon = (sportName: string) => {
    const icons: { [key: string]: string } = {
      'Tenis': '🎾',
      'Pádel': '🏓',
      'Fútbol': '⚽'
    }
    return icons[sportName] || '🏟️'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Cargando gestión de canchas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Canchas</h1>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cancha
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Canchas</p>
                  <p className="text-2xl font-bold text-gray-900">{courts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courts.filter(c => c.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactivas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {courts.filter(c => !c.active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${courts.length > 0 
                      ? Math.round(courts.reduce((sum, c) => sum + c.price_per_hour, 0) / courts.length)
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courts List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Canchas</CardTitle>
            <CardDescription>
              Gestiona todas las canchas del centro deportivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courts.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay canchas registradas</h3>
                <p className="text-gray-600 mb-4">Comienza creando tu primera cancha</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Cancha
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courts.map((court) => (
                  <Card key={court.id} className={`hover:shadow-md transition-shadow ${!court.active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {getSportIcon(court.sport_type.name)}
                          </span>
                          <h3 className="font-semibold text-lg">{court.name}</h3>
                        </div>
                        <Badge variant={court.active ? 'default' : 'secondary'}>
                          {court.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{court.sport_type.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${court.price_per_hour}/hora</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Hasta {court.max_people} personas</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(court)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(court)}
                          className={court.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {court.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                              <AlertDialogTitle>¿Eliminar cancha?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la cancha "{court.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(court)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCourt ? 'Editar Cancha' : 'Nueva Cancha'}
              </DialogTitle>
              <DialogDescription>
                {editingCourt 
                  ? 'Modifica los datos de la cancha' 
                  : 'Completa la información para crear una nueva cancha'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la cancha *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Cancha Tenis 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport_type">Tipo de deporte *</Label>
                <Select
                  value={formData.sport_type_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sport_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {sportTypes.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_per_hour">Precio por hora *</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                  placeholder="25.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_people">Máximo de personas *</Label>
                <Input
                  id="max_people"
                  type="number"
                  min="1"
                  value={formData.max_people}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_people: e.target.value }))}
                  placeholder="4"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de imagen (opcional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingCourt ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}