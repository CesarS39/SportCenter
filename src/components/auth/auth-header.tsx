import { Trophy } from 'lucide-react'

interface AuthHeaderProps {
  subtitle: string
}

export function AuthHeader({ subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <Trophy className="h-10 w-10 text-green-600 mr-3 flex-shrink-0" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SportCenter</h1>
      </div>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  )
}
