'use client'

import { useState, useEffect } from 'react'
import { format, addDays, isBefore, startOfDay, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Leaf, Sparkles, Waves } from 'lucide-react'

const SERVICES = [
  { id: 'relajante', name: 'Masaje Relajante', duration: '60 min', price: '$45', icon: Leaf },
  { id: 'descontracturante', name: 'Masaje Descontracturante', duration: '60 min', price: '$55', icon: Waves },
  { id: 'piedras', name: 'Masaje con Piedras Calientes', duration: '90 min', price: '$75', icon: Sparkles },
  { id: 'facial', name: 'Ritual Facial', duration: '45 min', price: '$40', icon: Sparkles },
]

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
]

type Step = 'service' | 'datetime' | 'form' | 'confirmed'

export default function BookingForm() {
  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [calendarOffset, setCalendarOffset] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState<{ id: string } | null>(null)

  const today = startOfDay(new Date())
  const calendarDays = Array.from({ length: 14 }, (_, i) => addDays(today, i + calendarOffset))
  const visibleDays = calendarDays.slice(0, 7)

  useEffect(() => {
    if (!selectedDate) return
    fetch(`/api/appointments?date=${format(selectedDate, 'yyyy-MM-dd')}`)
      .then((r) => r.json())
      .then((d) => setBookedTimes(d.bookedTimes ?? []))
  }, [selectedDate])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return
    setLoading(true)
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: form.name,
          client_email: form.email,
          client_phone: form.phone,
          service: selectedService,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConfirmation({ id: data.appointment.id.slice(0, 8).toUpperCase() })
      setStep('confirmed')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al reservar')
    } finally {
      setLoading(false)
    }
  }

  const service = SERVICES.find((s) => s.id === selectedService)

  if (step === 'confirmed' && confirmation) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-stone-800 mb-2">¡Reserva Confirmada!</h3>
        <p className="text-stone-500 mb-6">Te esperamos con mucho gusto</p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left max-w-sm mx-auto space-y-3">
          <div className="flex justify-between">
            <span className="text-stone-500 text-sm">Código</span>
            <span className="font-mono font-bold text-amber-700">#{confirmation.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 text-sm">Servicio</span>
            <span className="font-medium text-stone-800">{service?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 text-sm">Fecha</span>
            <span className="font-medium text-stone-800">
              {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 text-sm">Hora</span>
            <span className="font-medium text-stone-800">{selectedTime} hs</span>
          </div>
        </div>
        <p className="text-stone-400 text-sm mt-6">Recibirás una confirmación por email</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 justify-center">
        {(['service', 'datetime', 'form'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step === s ? 'bg-amber-500 text-white shadow-md shadow-amber-200' :
                ['service', 'datetime', 'form'].indexOf(step) > i
                  ? 'bg-amber-200 text-amber-700' : 'bg-stone-100 text-stone-400'}`}>
              {i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-px ${['service', 'datetime', 'form'].indexOf(step) > i ? 'bg-amber-300' : 'bg-stone-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 'service' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-stone-700 text-center">Elige tu servicio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep('datetime') }}
                  className="group p-4 border-2 border-stone-200 rounded-2xl text-left hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-stone-800 text-sm">{s.name}</div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.duration}
                        </span>
                        <span className="text-xs font-semibold text-amber-600">{s.price}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 'datetime' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('service')} className="text-stone-400 hover:text-stone-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-stone-700">Elige fecha y hora</h3>
          </div>

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-stone-600">
                {format(visibleDays[0], "MMMM yyyy", { locale: es })}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 7))}
                  disabled={calendarOffset === 0}
                  className="p-1 rounded-lg hover:bg-stone-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-500" />
                </button>
                <button
                  onClick={() => setCalendarOffset(calendarOffset + 7)}
                  className="p-1 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-stone-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {visibleDays.map((day) => {
                const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                const isPast = isBefore(day, today)
                const isSunday = getDay(day) === 0
                return (
                  <button
                    key={day.toISOString()}
                    disabled={isPast || isSunday}
                    onClick={() => { setSelectedDate(day); setSelectedTime('') }}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200
                      ${isSelected ? 'bg-amber-500 text-white shadow-md shadow-amber-200' :
                        isPast || isSunday ? 'opacity-30 cursor-not-allowed' :
                        'hover:bg-amber-50 hover:border-amber-300 border border-transparent'}`}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {format(day, 'EEE', { locale: es }).slice(0, 2)}
                    </span>
                    <span className="text-lg font-semibold mt-0.5">{format(day, 'd')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <h4 className="text-sm font-medium text-stone-600 mb-3">Horarios disponibles</h4>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time) => {
                  const booked = bookedTimes.includes(time)
                  const isSelected = selectedTime === time
                  return (
                    <button
                      key={time}
                      disabled={booked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${isSelected ? 'bg-amber-500 text-white shadow-md shadow-amber-200' :
                          booked ? 'bg-stone-100 text-stone-300 cursor-not-allowed line-through' :
                          'bg-stone-50 text-stone-700 hover:bg-amber-50 hover:text-amber-700 border border-stone-200 hover:border-amber-300'}`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep('form')}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-amber-200 disabled:shadow-none"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Step 3: Contact form */}
      {step === 'form' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('datetime')} className="text-stone-400 hover:text-stone-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-stone-700">Tus datos</h3>
          </div>

          {/* Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Servicio</span>
              <span className="font-medium text-stone-800">{service?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Fecha</span>
              <span className="font-medium text-stone-800">
                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Hora</span>
              <span className="font-medium text-stone-800">{selectedTime} hs</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'María González' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'maria@email.com' },
              { key: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+54 11 1234-5678' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-stone-800 placeholder:text-stone-300"
                />
              </div>
            ))}
          </div>

          <button
            disabled={!form.name || !form.email || !form.phone || loading}
            onClick={handleSubmit}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg shadow-amber-200 disabled:shadow-none"
          >
            {loading ? 'Confirmando...' : 'Confirmar Reserva'}
          </button>
        </div>
      )}
    </div>
  )
}
