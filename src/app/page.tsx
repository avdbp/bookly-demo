import BookingForm from '@/components/BookingForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafaf8]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-stone-900 text-white">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Turnos disponibles esta semana
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Serenity
            <span className="block text-amber-400">Spa & Masajes</span>
          </h1>
          <p className="text-stone-300 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Descubre el equilibrio entre cuerpo y mente.<br></br> Reserva tu sesión en minutos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-stone-400 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9 · 320 reseñas
            </span>
            <span>•</span>
            <span>Lunes a Sábado · 9 a 18 hs</span>
            <span>•</span>
            <span>Mallorca 1020, Barcelona</span>
          </div>
        </div>
      </div>

      {/* Booking Card */}
      <div className="max-w-2xl mx-auto px-6 -mt-8 pb-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-stone-200 border border-stone-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-stone-100 px-8 py-5">
            <h2
              className="text-xl font-bold text-stone-800"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Reservar turno
            </h2>
            <p className="text-stone-400 text-sm mt-0.5">Confirmación inmediata · Sin cargo</p>
          </div>
          <div className="p-8">
            <BookingForm />
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '🔒', text: 'Pago seguro al llegar' },
            { icon: '✨', text: 'Cancelación gratuita' },
            { icon: '📧', text: 'Confirmación por email' },
          ].map(({ icon, text }) => (
            <div key={text} className="bg-white rounded-2xl border border-stone-100 p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs text-stone-500 leading-tight">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
