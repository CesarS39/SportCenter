import { Card, CardContent } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'

export function RegisterSuccessCard() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h2>
          <p className="text-gray-600 mb-4">Tu cuenta ha sido creada correctamente. Redirigiendo...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
