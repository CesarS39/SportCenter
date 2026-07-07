import { Check, Loader2 } from 'lucide-react'

export function RegisterSuccessCard() {
  return (
    <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Registro exitoso!</h2>
      <p className="text-slate-500 mb-5">Tu cuenta ha sido creada correctamente. Redirigiendo...</p>
      <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
    </div>
  )
}
