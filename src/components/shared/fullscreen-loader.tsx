import { Trophy } from 'lucide-react'

interface FullscreenLoaderProps {
  message: string
}

export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
