import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, Users, Calendar, Trophy, Star, ArrowRight, Play, Shield, Zap, Award } from 'lucide-react'

export default function HomePage() {
  const courts = [
    { 
      name: 'Tenis', 
      count: 2, 
      price: 25, 
      icon: '🎾',
      description: 'Canchas profesionales con superficie de primera calidad',
      features: ['Iluminación LED', 'Superficie profesional', 'Graderías']
    },
    { 
      name: 'Pádel', 
      count: 2, 
      price: 30, 
      icon: '🏓',
      description: 'Canchas reglamentarias con cristales panorámicos',
      features: ['Cristal panorámico', 'Césped sintético', 'Climatizado']
    },
    { 
      name: 'Fútbol 5', 
      count: 1, 
      price: 50, 
      icon: '⚽',
      description: 'Campo de césped sintético de última generación',
      features: ['Césped FIFA Quality', 'Iluminación profesional', 'Vestuarios']
    }
  ]

  const features = [
    { 
      icon: <Calendar className="h-8 w-8" />, 
      title: 'Reservas Online', 
      desc: 'Sistema de reservas 24/7 con confirmación instantánea',
      color: 'bg-blue-500'
    },
    { 
      icon: <Shield className="h-8 w-8" />, 
      title: 'Seguridad Total', 
      desc: 'Instalaciones seguras con vigilancia y protocolos sanitarios',
      color: 'bg-green-500'
    },
    { 
      icon: <Zap className="h-8 w-8" />, 
      title: 'Tecnología Avanzada', 
      desc: 'Canchas equipadas con la mejor tecnología deportiva',
      color: 'bg-purple-500'
    },
    { 
      icon: <Award className="h-8 w-8" />, 
      title: 'Calidad Premium', 
      desc: 'Instalaciones certificadas de nivel profesional',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    { number: '500+', label: 'Miembros Activos', icon: <Users className="h-6 w-6" /> },
    { number: '2000+', label: 'Partidos Jugados', icon: <Trophy className="h-6 w-6" /> },
    { number: '98%', label: 'Satisfacción', icon: <Star className="h-6 w-6" /> },
    { number: '5', label: 'Canchas Premium', icon: <MapPin className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mejorado */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="relative">
                <Trophy className="h-10 w-10 text-green-600 mr-3" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SportCenter</h1>
                <p className="text-xs text-gray-500 font-medium">CLUB DEPORTIVO PREMIUM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" asChild className="hover:bg-green-50">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg">
                <Link href="/auth/register">
                  Únete Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Completamente renovado */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-blue-800"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-green-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            {/* Badge superior */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/30">
              <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
              Club Deportivo #1 en la Ciudad
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Vive el</span>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Deporte
              </span>
              <span className="block">como nunca antes</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              Canchas de nivel profesional, tecnología avanzada y una experiencia deportiva única. 
              <strong className="text-white">Reserva online en segundos.</strong>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-bold py-4 px-8 text-lg shadow-xl">
                <Link href="/auth/register" className="flex items-center">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="bg-white text-green-700 hover:bg-gray-100 font-bold py-4 px-8 text-lg shadow-xl">
                <Link href="#video-demo" className="flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center text-white/80 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Renovado */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              ¿Por qué SportCenter?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              La experiencia deportiva
              <span className="text-green-600"> definitiva</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Combinamos tecnología de vanguardia con instalaciones de primera clase para ofrecerte la mejor experiencia deportiva
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group hover:scale-105 transition-all duration-300">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 text-center h-full">
                  <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courts Section - Renovado */}
      <section id="canchas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              Nuestras Instalaciones
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Canchas de
              <span className="text-green-600"> nivel profesional</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada cancha está diseñada con los más altos estándares de calidad y equipada con tecnología de última generación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courts.map((court, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 shadow-xl hover:shadow-2xl bg-white overflow-hidden">
                <div className="relative">
                  {/* Header con gradiente */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="text-5xl mb-3">{court.icon}</div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{court.name}</h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {court.count} cancha{court.count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">${court.price}</div>
                          <div className="text-sm opacity-90">/hora</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">{court.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {court.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold py-3">
                      <Link href="/auth/register" className="flex items-center justify-center">
                        Reservar Ahora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Nueva */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para jugar al siguiente nivel?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Únete a nuestra comunidad deportiva y disfruta de instalaciones premium con reservas online 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-bold py-4 px-8 text-lg">
              <Link href="/auth/register">
                Registrarse Gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-green-700 hover:bg-gray-100 font-bold py-4 px-8 text-lg">
              <Link href="/auth/login">
                Ya soy miembro
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info - Renovado */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Ubicación Premium</h4>
              <p className="text-gray-300">Av. Principal 123, Ciudad</p>
              <p className="text-sm text-gray-400 mt-2">Zona exclusiva y segura</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Atención 24/7</h4>
              <p className="text-gray-300">+1 (555) 123-4567</p>
              <p className="text-sm text-gray-400 mt-2">Soporte personalizado</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Horarios Amplios</h4>
              <div className="text-gray-300 space-y-1">
                <p>Lun-Vie: 7:00 - 21:00</p>
                <p>Sáb: 9:00 - 14:00</p>
                <p>Dom: 9:00 - 12:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Renovado */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <span className="text-2xl font-bold">SportCenter</span>
                <div className="text-xs text-gray-400">CLUB DEPORTIVO PREMIUM</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-8 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
            </div>
            
            <p className="text-gray-400 mb-2">© 2025 SportCenter. Todos los derechos reservados kanek.</p>
            <p className="text-sm text-gray-500">Desarrollado con 💚 para los amantes del deporte</p>
          </div>
        </div>
      </footer>
    </div>
  )
}