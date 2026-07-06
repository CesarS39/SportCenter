import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { DollarSign, Edit, Eye, EyeOff, MapPin, Trash2, Users } from 'lucide-react'
import { getSportIcon } from '@/lib/sport-icons'
import type { Court } from '@/lib/hooks/use-courts'

interface CourtCardProps {
  court: Court
  onEdit: (court: Court) => void
  onToggleActive: (court: Court) => void
  onDelete: (court: Court) => void
}

export function CourtCard({ court, onEdit, onToggleActive, onDelete }: CourtCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${!court.active ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getSportIcon(court.sportType.name)}</span>
            <h3 className="font-semibold text-lg">{court.name}</h3>
          </div>
          <Badge variant={court.active ? 'default' : 'secondary'}>{court.active ? 'Activa' : 'Inactiva'}</Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{court.sportType.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>${court.pricePerHour}/hora</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Hasta {court.maxPeople} personas</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(court)} className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(court)}
            className={court.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {court.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar cancha?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la cancha &quot;{court.name}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(court)} className="bg-red-600 hover:bg-red-700">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
