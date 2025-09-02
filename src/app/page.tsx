import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, Users, Calendar, Trophy } from 'lucide-react'

export default function HomePage() {
  const courts = [
    { name: 'Tenis', count: 2, price: 25, icon: '🎾' },
    { name: 'Pádel', count: 2, price: 30, icon: '🏓' },
    { name: 'Fútbol 5', count: 1, price: 50, icon: '⚽' }
  ]

  const features = [
    { icon: <Calendar className="h-6 w-6" />, title: 'Reservas Online', desc: 'Reserva tu cancha las 24 horas' },
    { icon: <Clock className="h-6 w-6" />, title: 'Horarios Flexibles', desc: 'Abierto todos los días' },
    { icon: <Users className="h-6 w-6" />, title: 'Para Todos', desc: 'Canchas para diferentes deportes' },
    { icon: <Trophy className="h-6 w-6" />, title: 'Calidad Premium', desc: 'Instalaciones de primera' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SportCenter</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Reserva tu cancha favorita
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Disfruta de nuestras canchas de tenis, pádel y fútbol. Reserva online de manera fácil y rápida.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/register">Empezar Ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#canchas">Ver Canchas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir SportCenter?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-green-600">{feature.icon}</div>
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courts Section */}
      <section id="canchas" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nuestras Canchas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courts.map((court, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{court.icon}</div>
                  <CardTitle className="flex justify-between items-center">
                    {court.name}
                    <Badge variant="secondary">{court.count} canchas</Badge>
                  </CardTitle>
                  <CardDescription>
                    Desde ${court.price}/hora
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <Link href="/auth/register">Reservar</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 mb-4 text-green-400" />
              <h4 className="text-xl font-semibold mb-2">Ubicación</h4>
              <p className="text-gray-300">Av. Principal 123, Ciudad</p>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="h-8 w-8 mb-4 text-green-400" />
              <h4 className="text-xl font-semibold mb-2">Teléfono</h4>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 mb-4 text-green-400" />
              <h4 className="text-xl font-semibold mb-2">Horarios</h4>
              <div className="text-gray-300 text-sm">
                <p>Lun-Vie: 7:00 - 21:00</p>
                <p>Sáb: 9:00 - 14:00</p>
                <p>Dom: 9:00 - 12:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-6 w-6 text-green-400 mr-2" />
            <span className="text-xl font-bold">SportCenter</span>
          </div>
          <p className="text-gray-400">© 2025 SportCenter. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}