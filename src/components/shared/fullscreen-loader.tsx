import { Trophy } from 'lucide-react'

interface FullscreenLoaderProps {
  message: string
}

export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 mx-auto mb-4 animate-pulse">
          <Trophy className="h-7 w-7 text-white" />
        </div>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  )
}
