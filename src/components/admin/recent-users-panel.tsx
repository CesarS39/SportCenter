import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import type { RecentUser } from '@/lib/hooks/use-admin-stats'
import { getInitials } from '@/lib/utils'

interface RecentUsersPanelProps {
  users: RecentUser[]
  variant: 'mobile' | 'desktop'
}

export function RecentUsersPanel({ users, variant }: RecentUsersPanelProps) {
  const items = users.slice(0, 5)

  if (variant === 'mobile') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Usuarios Recientes</CardTitle>
              <CardDescription className="text-sm">Últimos usuarios registrados</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/usuarios">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((user) => (
              <Card key={user.id} className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate">{user.phone || 'Sin teléfono'}</p>
                      <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {user.role}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usuarios Recientes</CardTitle>
            <CardDescription>Últimos usuarios registrados</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/usuarios">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">
                  {user.phone || 'Sin teléfono'} • {new Date(user.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
