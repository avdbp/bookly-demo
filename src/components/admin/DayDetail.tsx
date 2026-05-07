'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { X } from 'lucide-react'
import { Appointment } from '@/lib/supabase'

export default function DayDetail({
  date,
  appointments,
  timeSlots,
  onClose,
}: {
  date: Date
  appointments: Appointment[]
  timeSlots: string[]
  onClose: () => void
}) {
  const booked = appointments.map((a) => a.time)
  const free = timeSlots.filter((t) => !booked.includes(t))

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden sticky top-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-amber-50">
        <div>
          <h3 className="font-semibold text-stone-800 capitalize text-sm">
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {appointments.length} citas · {free.length} libres
          </p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-stone-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {timeSlots.map((time) => {
          const apt = appointments.find((a) => a.time === time)
          return (
            <div key={time} className={`rounded-xl p-3 ${apt ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50 border border-stone-100'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-500">{time}</span>
                {apt
                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Reservado</span>
                  : <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">Libre</span>
                }
              </div>
              {apt ? (
                <div>
                  <div className="font-semibold text-stone-800 text-sm">{apt.client_name}</div>
                  <div className="text-xs text-amber-600 mt-0.5">{apt.service}</div>
                  <div className="text-xs text-stone-400 mt-1">{apt.client_email} · {apt.client_phone}</div>
                </div>
              ) : (
                <div className="text-xs text-stone-400">Disponible</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
