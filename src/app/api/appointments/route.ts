import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/emails'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .select('time')
    .eq('date', date)
    .eq('status', 'confirmed')

  if (error) {
    console.error('GET error:', JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookedTimes: data.map((a) => a.time) })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { client_name, client_email, client_phone, service, date, time } = body

  if (!client_name || !client_email || !client_phone || !service || !date || !time) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  // Check slot is still available
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .eq('status', 'confirmed')
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Este horario ya fue reservado' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ client_name, client_email, client_phone, service, date, time }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  sendConfirmationEmail(data).catch((err) => console.error('EMAIL ERROR:', err))

  return NextResponse.json({ appointment: data }, { status: 201 })
}
