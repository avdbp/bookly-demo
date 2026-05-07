'use client'

import { useState, useEffect } from 'react'
import AdminCalendar from '@/components/admin/AdminCalendar'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_auth') === '1')
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (user === 'demo' && pass === '0000') {
      sessionStorage.setItem('admin_auth', '1')
      setAuthed(true)
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="bg-gradient-to-br from-stone-800 to-stone-900 px-8 py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              Panel de Administración
            </h1>
            <p className="text-stone-400 text-sm mt-1">Serenity Spa & Masajes</p>
          </div>
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Usuario</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="demo"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all text-stone-800"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-amber-200"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminCalendar onLogout={handleLogout} />
}
