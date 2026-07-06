import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, DollarSign, Users } from 'lucide-react'
import { getSportIcon } from '@/lib/sport-icons'
import type { Court } from '@/lib/hooks/use-courts'
import type { SportType } from '@/lib/hooks/use-sport-types'

interface CourtsBySport {
  sportType: SportType
  courts: Court[]
}

interface CourtSelectorStepProps {
  courtsBySport: Record<string, CourtsBySport>
  openSportTypes: string[]
  selectedCourtId: string | null
  onToggleSportType: (sportTypeId: string) => void
  onSelectCourt: (court: Court) => void
}

export function CourtSelectorStep({
  courtsBySport,
  openSportTypes,
  selectedCourtId,
  onToggleSportType,
  onSelectCourt,
}: CourtSelectorStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
          Seleccionar Cancha
        </CardTitle>
        <CardDescription>Elige la cancha que deseas reservar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(courtsBySport).map(([sportTypeId, { sportType, courts }]) => (
          <Collapsible
            key={sportTypeId}
            open={openSportTypes.includes(sportTypeId)}
            onOpenChange={() => onToggleSportType(sportTypeId)}
          >
            <CollapsibleTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getSportIcon(sportType.name)}</div>
                      <div>
                        <h3 className="font-semibold">{sportType.name}</h3>
                        <p className="text-sm text-gray-600">
                          {courts.length} cancha{courts.length !== 1 ? 's' : ''} disponible{courts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {openSportTypes.includes(sportTypeId) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {courts.map((court) => (
                <Card
                  key={court.id}
                  className={`cursor-pointer transition-all hover:shadow-md ml-4 ${
                    selectedCourtId === court.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => onSelectCourt(court)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{court.name}</h4>
                      {selectedCourtId === court.id && <Badge className="bg-green-600">Seleccionada</Badge>}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />${court.pricePerHour}/hora
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Hasta {court.maxPeople} personas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  )
}
