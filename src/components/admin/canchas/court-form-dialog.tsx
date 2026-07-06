import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Court, CourtFormInput } from '@/lib/hooks/use-courts'
import type { SportType } from '@/lib/hooks/use-sport-types'

interface FormState {
  name: string
  sportTypeId: string
  pricePerHour: string
  maxPeople: string
  imageUrl: string
}

const EMPTY_FORM: FormState = { name: '', sportTypeId: '', pricePerHour: '', maxPeople: '', imageUrl: '' }

interface CourtFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCourt: Court | null
  sportTypes: SportType[]
  submitting: boolean
  onSubmit: (input: CourtFormInput) => void
}

export function CourtFormDialog({
  open,
  onOpenChange,
  editingCourt,
  sportTypes,
  submitting,
  onSubmit,
}: CourtFormDialogProps) {
  const [formData, setFormData] = useState<FormState>(() =>
    editingCourt
      ? {
          name: editingCourt.name,
          sportTypeId: editingCourt.sportTypeId,
          pricePerHour: editingCourt.pricePerHour.toString(),
          maxPeople: editingCourt.maxPeople.toString(),
          imageUrl: editingCourt.imageUrl || '',
        }
      : EMPTY_FORM
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.sportTypeId || !formData.pricePerHour || !formData.maxPeople) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    const pricePerHour = parseFloat(formData.pricePerHour)
    const maxPeople = parseInt(formData.maxPeople)

    if (isNaN(pricePerHour) || pricePerHour <= 0) {
      toast.error('El precio por hora debe ser un número válido mayor a 0')
      return
    }
    if (isNaN(maxPeople) || maxPeople <= 0) {
      toast.error('El número máximo de personas debe ser un número válido mayor a 0')
      return
    }

    onSubmit({
      name: formData.name,
      sportTypeId: formData.sportTypeId,
      pricePerHour,
      maxPeople,
      imageUrl: formData.imageUrl || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingCourt ? 'Editar Cancha' : 'Nueva Cancha'}</DialogTitle>
          <DialogDescription>
            {editingCourt ? 'Modifica los datos de la cancha' : 'Completa la información para crear una nueva cancha'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la cancha *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Cancha Tenis 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport_type">Tipo de deporte *</Label>
            <Select
              value={formData.sportTypeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, sportTypeId: value }))}
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
              value={formData.pricePerHour}
              onChange={(e) => setFormData((prev) => ({ ...prev, pricePerHour: e.target.value }))}
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
              value={formData.maxPeople}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxPeople: e.target.value }))}
              placeholder="4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de imagen (opcional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingCourt ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
