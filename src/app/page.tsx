import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, Users, Calendar, Trophy, Star, ArrowRight, Play, Shield, Zap, Award, Menu } from 'lucide-react'

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
      icon: <Calendar className="h-7 w-7" />, 
      title: 'Reservas Online', 
      desc: 'Sistema de reservas 24/7 con confirmación instantánea',
      color: 'bg-slate-600'
    },
    { 
      icon: <Shield className="h-7 w-7" />, 
      title: 'Seguridad Total', 
      desc: 'Instalaciones seguras con vigilancia y protocolos sanitarios',
      color: 'bg-emerald-600'
    },
    { 
      icon: <Zap className="h-7 w-7" />, 
      title: 'Tecnología Avanzada', 
      desc: 'Canchas equipadas con la mejor tecnología deportiva',
      color: 'bg-indigo-600'
    },
    { 
      icon: <Award className="h-7 w-7" />, 
      title: 'Calidad Premium', 
      desc: 'Instalaciones certificadas de nivel profesional',
      color: 'bg-amber-600'
    }
  ]

  const stats = [
    { number: '500+', label: 'Miembros Activos', icon: <Users className="h-5 w-5" /> },
    { number: '2000+', label: 'Partidos Jugados', icon: <Trophy className="h-5 w-5" /> },
    { number: '98%', label: 'Satisfacción', icon: <Star className="h-5 w-5" /> },
    { number: '5', label: 'Canchas Premium', icon: <MapPin className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Mejorado para mobile */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center min-w-0">
              <div className="relative flex-shrink-0">
                <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 mr-2 sm:mr-3" />
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">SportCenter</h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">CLUB DEPORTIVO PREMIUM</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex gap-3">
              <Button variant="ghost" asChild className="hover:bg-emerald-50 transition-colors">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
                <Link href="/auth/register">
                  <span className="hidden md:inline">Únete Ahora</span>
                  <span className="md:hidden">Únete</span>
                  <ArrowRight className="ml-1 md:ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/register">
                  Únete
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Colores suaves */}
      <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
        {/* Background gradient suave */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-700"></div>
        
        {/* Decorative elements suaves */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-32 sm:w-48 h-32 sm:h-48 bg-teal-400/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            {/* Badge superior */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-white/20">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-amber-300 fill-current" />
              Club Deportivo #1 en la Ciudad
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Vive el</span>
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Deporte
              </span>
              <span className="block">como nunca antes</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-100 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Canchas de nivel profesional, tecnología avanzada y una experiencia deportiva única. 
              <strong className="text-white">Reserva online en segundos.</strong>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-10 sm:mb-12 px-4">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-50 font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg shadow-lg transition-colors">
                <Link href="/auth/register" className="flex items-center justify-center w-full">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center text-white/70 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-slate-200 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Colores suaves */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 bg-slate-100 text-slate-700">
              ¿Por qué SportCenter?
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              La experiencia deportiva
              <span className="text-emerald-600"> definitiva</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Combinamos tecnología de vanguardia con instalaciones de primera clase para ofrecerte la mejor experiencia deportiva
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg border border-slate-100 text-center h-full transition-all duration-300 hover:scale-105">
                  <div className={`${feature.color} w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white group-hover:scale-105 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courts Section - Mejorado */}
      <section id="canchas" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 bg-slate-100 text-slate-700">
              Nuestras Instalaciones
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Canchas de
              <span className="text-emerald-600"> nivel profesional</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Cada cancha está diseñada con los más altos estándares de calidad y equipada con tecnología de última generación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courts.map((court, index) => (
              <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 shadow-lg hover:shadow-xl bg-white overflow-hidden">
                <div className="relative">
                  {/* Header con gradiente suave */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
                    <div className="relative z-10">
                      <div className="text-3xl sm:text-5xl mb-3">{court.icon}</div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">{court.name}</h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs sm:text-sm">
                            {court.count} cancha{court.count > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl sm:text-3xl font-bold">${court.price}</div>
                          <div className="text-xs sm:text-sm opacity-90">/hora</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm sm:text-base">{court.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {court.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs sm:text-sm text-slate-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold py-2.5 sm:py-3 transition-colors">
                      <Link href="/auth/register" className="flex items-center justify-center w-full">
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

      {/* CTA Section - Colores suaves */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <div className="absolute top-20 left-10 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-80 h-64 sm:h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para jugar al siguiente nivel?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-slate-100">
            Únete a nuestra comunidad deportiva y disfruta de instalaciones premium con reservas online 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-50 font-bold py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg transition-colors">
              <Link href="/auth/register">
                Registrarse Gratis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info - Suave */}
      <section className="py-12 sm:py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-emerald-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Ubicación Premium</h4>
              <p className="text-slate-300 text-sm sm:text-base">Av. Principal 123, Ciudad</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">Zona exclusiva y segura</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-slate-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Atención 24/7</h4>
              <p className="text-slate-300 text-sm sm:text-base">+1 (555) 123-4567</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">Soporte personalizado</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-indigo-600 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Horarios Amplios</h4>
              <div className="text-slate-300 space-y-1 text-sm sm:text-base">
                <p>Lun-Vie: 7:00 - 21:00</p>
                <p>Sáb: 9:00 - 14:00</p>
                <p>Dom: 9:00 - 12:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Elegante */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400 mr-2 sm:mr-3" />
              <div>
                <span className="text-xl sm:text-2xl font-bold">SportCenter</span>
                <div className="text-xs text-slate-400">CLUB DEPORTIVO PREMIUM</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-6 sm:space-x-8 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-300"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-700"></div>
            </div>
            
            <p className="text-slate-400 mb-2 text-sm sm:text-base">© 2025 SportCenter. Todos los derechos reservados Kanek.</p>
            <p className="text-xs sm:text-sm text-slate-500">Desarrollado con 💚 para los amantes del deporte</p>
          </div>
        </div>
      </footer>
    </div>
  )
}