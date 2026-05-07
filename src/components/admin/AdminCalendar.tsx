'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addWeeks, addMonths, addYears,
  subDays, subWeeks, subMonths, subYears,
  isSameMonth, isSameDay, isToday,
  startOfYear, endOfYear, getMonth,
  eachMonthOfInterval,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, LogOut, Calendar } from 'lucide-react'
import { Appointment } from '@/lib/supabase'
import DayDetail from './DayDetail'

type View = 'year' | 'month' | 'week' | 'day'

const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']

export default function AdminCalendar({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>('month')
  const [current, setCurrent] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [summaryEnabled, setSummaryEnabled] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.daily_summary_enabled !== undefined) {
          setSummaryEnabled(d.settings.daily_summary_enabled === 'true')
        }
      })
  }, [])

  const toggleSummary = async () => {
    setSummaryLoading(true)
    const newValue = !summaryEnabled
    setSummaryEnabled(newValue)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'daily_summary_enabled', value: String(newValue) }),
    })
    setSummaryLoading(false)
  }

  const fetchAppointments = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/appointments?from=${from}&to=${to}`)
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let from: string, to: string
    if (view === 'year') {
      from = format(startOfYear(current), 'yyyy-MM-dd')
      to = format(endOfYear(current), 'yyyy-MM-dd')
    } else if (view === 'month') {
      from = format(startOfMonth(current), 'yyyy-MM-dd')
      to = format(endOfMonth(current), 'yyyy-MM-dd')
    } else if (view === 'week') {
      from = format(startOfWeek(current, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      to = format(endOfWeek(current, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    } else {
      from = format(current, 'yyyy-MM-dd')
      to = format(current, 'yyyy-MM-dd')
    }
    fetchAppointments(from, to)
  }, [current, view, fetchAppointments])

  const navigate = (dir: 1 | -1) => {
    if (view === 'year') setCurrent(dir === 1 ? addYears(current, 1) : subYears(current, 1))
    else if (view === 'month') setCurrent(dir === 1 ? addMonths(current, 1) : subMonths(current, 1))
    else if (view === 'week') setCurrent(dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1))
    else setCurrent(dir === 1 ? addDays(current, 1) : subDays(current, 1))
  }

  const aptsForDay = (date: Date) =>
    appointments.filter((a) => a.date === format(date, 'yyyy-MM-dd'))

  const title = () => {
    if (view === 'year') return format(current, 'yyyy')
    if (view === 'month') return format(current, "MMMM yyyy", { locale: es })
    if (view === 'week') {
      const start = startOfWeek(current, { weekStartsOn: 1 })
      const end = endOfWeek(current, { weekStartsOn: 1 })
      return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`
    }
    return format(current, "EEEE d 'de' MMMM yyyy", { locale: es })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>Serenity Admin</h1>
            <p className="text-stone-400 text-xs">Panel de reservas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Daily summary toggle */}
          <div className="flex items-center gap-2.5">
            <span className="text-stone-400 text-xs hidden sm:block">Resumen diario</span>
            <button
              onClick={toggleSummary}
              disabled={summaryLoading}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                ${summaryEnabled ? 'bg-amber-500' : 'bg-stone-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                ${summaryEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* View switcher */}
          <div className="flex bg-white border border-stone-200 rounded-xl p-1 gap-1">
            {(['year','month','week','day'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${view === v ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
              >
                {v === 'year' ? 'Año' : v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-amber-400 transition-colors">
              <ChevronLeft className="w-4 h-4 text-stone-600" />
            </button>
            <button onClick={() => setCurrent(new Date())} className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:border-amber-400 transition-colors">
              Hoy
            </button>
            <span className="text-stone-800 font-semibold text-sm capitalize min-w-40 text-center">{title()}</span>
            <button onClick={() => navigate(1)} className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center hover:border-amber-400 transition-colors">
              <ChevronRight className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-stone-500">
            {loading ? (
              <span className="text-amber-500">Cargando...</span>
            ) : (
              <span><span className="font-bold text-stone-800">{appointments.length}</span> citas en este período</span>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Calendar */}
          <div className="flex-1">
            {view === 'year' && <YearView current={current} appointments={appointments} onDayClick={(d) => { setSelectedDay(d); setView('day'); setCurrent(d) }} />}
            {view === 'month' && <MonthView current={current} appointments={appointments} onDayClick={setSelectedDay} selectedDay={selectedDay} />}
            {view === 'week' && <WeekView current={current} appointments={appointments} onDayClick={setSelectedDay} selectedDay={selectedDay} />}
            {view === 'day' && <DayViewFull current={current} appointments={aptsForDay(current)} />}
          </div>

          {/* Day detail panel */}
          {selectedDay && view !== 'day' && (
            <div className="w-80 shrink-0">
              <DayDetail
                date={selectedDay}
                appointments={aptsForDay(selectedDay)}
                timeSlots={TIME_SLOTS}
                onClose={() => setSelectedDay(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Year View ────────────────────────────────────────────────────────────────
function YearView({ current, appointments, onDayClick }: {
  current: Date
  appointments: Appointment[]
  onDayClick: (d: Date) => void
}) {
  const months = eachMonthOfInterval({ start: startOfYear(current), end: endOfYear(current) })
  return (
    <div className="grid grid-cols-3 gap-4">
      {months.map((month) => {
        const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
        const days: Date[] = []
        let d = start
        while (d <= end) { days.push(d); d = addDays(d, 1) }
        return (
          <div key={month.toISOString()} className="bg-white rounded-2xl border border-stone-100 p-4">
            <h3 className="text-sm font-semibold text-stone-700 capitalize mb-3">
              {format(month, 'MMMM', { locale: es })}
            </h3>
            <div className="grid grid-cols-7 gap-0.5">
              {['L','M','X','J','V','S','D'].map((d) => (
                <div key={d} className="text-center text-xs text-stone-400 pb-1">{d}</div>
              ))}
              {days.map((day) => {
                const apts = appointments.filter((a) => a.date === format(day, 'yyyy-MM-dd'))
                const inMonth = isSameMonth(day, month)
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => inMonth && onDayClick(day)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
                      ${!inMonth ? 'opacity-0 pointer-events-none' :
                        isToday(day) ? 'bg-amber-500 text-white font-bold' :
                        apts.length > 0 ? 'bg-amber-100 text-amber-700 font-medium hover:bg-amber-200' :
                        'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {inMonth ? format(day, 'd') : ''}
                    {apts.length > 0 && inMonth && (
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────
function MonthView({ current, appointments, onDayClick, selectedDay }: {
  current: Date
  appointments: Appointment[]
  onDayClick: (d: Date) => void
  selectedDay: Date | null
}) {
  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 })
  const days: Date[] = []
  let d = start
  while (d <= end) { days.push(d); d = addDays(d, 1) }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-stone-100">
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => (
          <div key={d} className="py-3 text-center text-xs font-semibold text-stone-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const apts = appointments.filter((a) => a.date === format(day, 'yyyy-MM-dd'))
          const inMonth = isSameMonth(day, current)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-24 p-2 border-b border-r border-stone-50 text-left transition-all hover:bg-amber-50
                ${!inMonth ? 'bg-stone-50/50' : ''}
                ${isSelected ? 'ring-2 ring-inset ring-amber-400' : ''}`}
            >
              <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1
                ${isToday(day) ? 'bg-amber-500 text-white' :
                  !inMonth ? 'text-stone-300' : 'text-stone-700'}`}>
                {format(day, 'd')}
              </span>
              <div className="space-y-0.5">
                {apts.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 truncate">
                    {apt.time} {apt.client_name.split(' ')[0]}
                  </div>
                ))}
                {apts.length > 3 && (
                  <div className="text-xs text-stone-400">+{apts.length - 3} más</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────
function WeekView({ current, appointments, onDayClick, selectedDay }: {
  current: Date
  appointments: Appointment[]
  onDayClick: (d: Date) => void
  selectedDay: Date | null
}) {
  const start = startOfWeek(current, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']

  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-stone-100">
        <div className="py-3" />
        {days.map((day) => {
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`py-3 text-center transition-all hover:bg-amber-50 ${isSelected ? 'bg-amber-50' : ''}`}
            >
              <div className="text-xs text-stone-400 uppercase tracking-wide">
                {format(day, 'EEE', { locale: es })}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-semibold
                ${isToday(day) ? 'bg-amber-500 text-white' : 'text-stone-700'}`}>
                {format(day, 'd')}
              </div>
            </button>
          )
        })}
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-8 border-b border-stone-50 min-h-14">
            <div className="px-3 py-2 text-xs text-stone-400 font-medium">{time}</div>
            {days.map((day) => {
              const apt = appointments.find(
                (a) => a.date === format(day, 'yyyy-MM-dd') && a.time === time
              )
              return (
                <div
                  key={day.toISOString()}
                  className="border-l border-stone-50 p-1 hover:bg-amber-50 cursor-pointer transition-colors"
                  onClick={() => onDayClick(day)}
                >
                  {apt && (
                    <div className="bg-amber-100 border border-amber-200 rounded-lg px-2 py-1 text-xs">
                      <div className="font-medium text-amber-800 truncate">{apt.client_name.split(' ')[0]}</div>
                      <div className="text-amber-600 truncate">{apt.service.slice(0, 12)}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Day View (full) ──────────────────────────────────────────────────────────
function DayViewFull({ current, appointments }: { current: Date; appointments: Appointment[] }) {
  const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00']
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100">
        <h3 className="font-semibold text-stone-800 capitalize">
          {format(current, "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        <p className="text-sm text-stone-400">{appointments.length} citas · {TIME_SLOTS.length - appointments.length} horarios libres</p>
      </div>
      <div>
        {TIME_SLOTS.map((time) => {
          const apt = appointments.find((a) => a.time === time)
          return (
            <div key={time} className={`flex gap-4 px-6 py-4 border-b border-stone-50 ${apt ? 'bg-amber-50' : ''}`}>
              <div className="w-14 text-sm font-medium text-stone-500 shrink-0 pt-0.5">{time}</div>
              {apt ? (
                <div className="flex-1 bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-stone-800">{apt.client_name}</div>
                      <div className="text-sm text-amber-600 font-medium mt-0.5">{apt.service}</div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Confirmada</span>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-stone-500">
                    <span>📧 {apt.client_email}</span>
                    <span>📞 {apt.client_phone}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-stone-200 rounded-xl flex items-center justify-center text-sm text-stone-300 py-3">
                  Horario libre
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
