import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Phone, Users, Calendar, Trophy, Star, ArrowRight, Shield, Zap, Award } from 'lucide-react'

export default function HomePage() {
  const courts = [
    {
      name: 'Tenis',
      count: 2,
      price: 25,
      icon: '🎾',
      description: 'Canchas profesionales con superficie de primera calidad',
      features: ['Iluminación LED', 'Superficie profesional', 'Graderías'],
    },
    {
      name: 'Pádel',
      count: 2,
      price: 30,
      icon: '🏓',
      description: 'Canchas reglamentarias con cristales panorámicos',
      features: ['Cristal panorámico', 'Césped sintético', 'Climatizado'],
    },
    {
      name: 'Fútbol 5',
      count: 1,
      price: 50,
      icon: '⚽',
      description: 'Campo de césped sintético de última generación',
      features: ['Césped FIFA Quality', 'Iluminación profesional', 'Vestuarios'],
    },
  ]

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Reservas Online',
      desc: 'Sistema de reservas 24/7 con confirmación instantánea',
      tint: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Seguridad Total',
      desc: 'Instalaciones seguras con vigilancia y protocolos sanitarios',
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Tecnología Avanzada',
      desc: 'Canchas equipadas con la mejor tecnología deportiva',
      tint: 'bg-purple-50 text-purple-600',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Calidad Premium',
      desc: 'Instalaciones certificadas de nivel profesional',
      tint: 'bg-amber-50 text-amber-600',
    },
  ]

  const stats = [
    { number: '500+', label: 'Miembros Activos', icon: <Users className="h-5 w-5" /> },
    { number: '2000+', label: 'Partidos Jugados', icon: <Trophy className="h-5 w-5" /> },
    { number: '98%', label: 'Satisfacción', icon: <Star className="h-5 w-5" /> },
    { number: '5', label: 'Canchas Premium', icon: <MapPin className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center min-w-0">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-600 mr-2.5 sm:mr-3 flex-shrink-0">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">SportCenter</h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">CLUB DEPORTIVO PREMIUM</p>
              </div>
            </div>

            <div className="hidden sm:flex gap-3">
              <Button variant="ghost" asChild className="rounded-xl hover:bg-emerald-50 transition-colors">
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors">
                <Link href="/auth/register">
                  <span className="hidden md:inline">Únete Ahora</span>
                  <span className="md:hidden">Únete</span>
                  <ArrowRight className="ml-1 md:ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex sm:hidden gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-lg">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="rounded-lg bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/register">Únete</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-mesh-emerald" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-xl rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-white/15">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-amber-300 fill-current" />
              Club Deportivo #1 en la Ciudad
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block">Vive el</span>
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Deporte
              </span>
              <span className="block">como nunca antes</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Canchas de nivel profesional, tecnología avanzada y una experiencia deportiva única.{' '}
              <strong className="text-white">Reserva online en segundos.</strong>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-10 sm:mb-16 px-4">
              <Button size="lg" asChild className="rounded-xl bg-white text-emerald-700 hover:bg-slate-50 font-bold py-3 sm:py-4 px-6 sm:px-8 h-auto text-base sm:text-lg shadow-lg transition-colors">
                <Link href="/auth/register" className="flex items-center justify-center w-full">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 py-4 sm:py-6 px-2">
                  <div className="flex justify-center text-emerald-300 mb-2">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              ¿Por qué SportCenter?
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              La experiencia deportiva
              <span className="text-emerald-600"> definitiva</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Combinamos tecnología de vanguardia con instalaciones de primera clase para ofrecerte la mejor
              experiencia deportiva
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md border border-slate-100 text-center h-full transition-all duration-300"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 ${feature.tint}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courts */}
      <section id="canchas" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              Nuestras Instalaciones
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Canchas de
              <span className="text-emerald-600"> nivel profesional</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Cada cancha está diseñada con los más altos estándares de calidad y equipada con tecnología de última
              generación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courts.map((court, index) => (
              <Card
                key={index}
                className="group hover:-translate-y-1 transition-all duration-300 border-slate-100 shadow-sm hover:shadow-xl bg-white overflow-hidden rounded-2xl p-0 gap-0"
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-4 sm:p-6 text-white relative overflow-hidden rounded-t-2xl">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16" />
                    <div className="relative z-10">
                      <div className="text-3xl sm:text-5xl mb-3">{court.icon}</div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-1">{court.name}</h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs sm:text-sm rounded-full">
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

                  <CardContent className="p-4 sm:p-6">
                    <p className="text-slate-600 mb-4 leading-relaxed text-sm sm:text-base">{court.description}</p>

                    <div className="space-y-2 mb-6">
                      {court.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs sm:text-sm text-slate-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold py-2.5 sm:py-3 h-auto transition-colors">
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

      {/* CTA */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-mesh-emerald opacity-80" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            ¿Listo para jugar al siguiente nivel?
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-slate-200">
            Únete a nuestra comunidad deportiva y disfruta de instalaciones premium con reservas online 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="rounded-xl bg-white text-emerald-700 hover:bg-slate-50 font-bold py-3 sm:py-4 px-6 sm:px-8 h-auto text-base sm:text-lg transition-colors">
              <Link href="/auth/register">Registrarse Gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 sm:py-16 bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-emerald-500/15 text-emerald-300 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Ubicación Premium</h4>
              <p className="text-slate-300 text-sm sm:text-base">Av. Principal 123, Ciudad</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">Zona exclusiva y segura</p>
            </div>

            <div className="text-center group">
              <div className="bg-blue-500/15 text-blue-300 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2">Atención 24/7</h4>
              <p className="text-slate-300 text-sm sm:text-base">+1 (555) 123-4567</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">Soporte personalizado</p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-500/15 text-purple-300 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
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

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-600 mr-2 sm:mr-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </span>
              <div>
                <span className="text-xl sm:text-2xl font-bold">SportCenter</span>
                <div className="text-xs text-slate-400">CLUB DEPORTIVO PREMIUM</div>
              </div>
            </div>

            <div className="flex justify-center space-x-6 sm:space-x-8 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-300" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-700" />
            </div>

            <p className="text-slate-400 mb-2 text-sm sm:text-base">© 2026 SportCenter. Todos los derechos reservados Kanek.</p>
            <p className="text-xs sm:text-sm text-slate-500">Desarrollado con 💚 para los amantes del deporte</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
