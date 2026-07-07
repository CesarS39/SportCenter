import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { SportType } from '@/lib/hooks/use-sport-types'

export interface ReservationFilterState {
  status: string
  sportType: string
  searchTerm: string
}

interface ReservationFiltersSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ReservationFilterState
  onChange: (filters: ReservationFilterState) => void
  sportTypes: SportType[]
}

export function ReservationFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  sportTypes,
}: ReservationFiltersSheetProps) {
  const clearFilters = () => onChange({ status: 'all', sportType: 'all', searchTerm: '' })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] max-w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Ajusta los filtros para encontrar reservas específicas</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Usuario, cancha..."
                value={filters.searchTerm}
                onChange={(e) => onChange({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
                <SelectItem value="CANCELLED_ADMIN">Canceladas por Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Deporte</label>
            <Select value={filters.sportType} onValueChange={(value) => onChange({ ...filters, sportType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Deporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los deportes</SelectItem>
                {sportTypes.map((sport) => (
                  <SelectItem key={sport.id} value={sport.name}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={clearFilters} className="flex-1">
              Limpiar
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
